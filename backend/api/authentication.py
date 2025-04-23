from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class FirebaseOrJWTAuthentication(BaseAuthentication):
    """
    Custom authentication class that supports both Django JWT tokens and Firebase tokens.
    """
    
    def authenticate(self, request):
        """
        Authenticate the request and return a tuple of (user, token).
        """
        # Get the auth header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        logger.info(f"Authenticating request to {request.path}")
        
        if not auth_header.startswith('Bearer '):
            logger.warning(f"No Bearer token found in Authorization header")
            return None
            
        token = auth_header.split(' ')[1]
        
        if not token:
            logger.warning("Empty token found")
            return None
        
        # Check for Django user ID in query parameters (used for Google auth)
        django_user_id = request.GET.get('django_user_id')
        if django_user_id:
            logger.info(f"Found django_user_id in query params: {django_user_id}")
            try:
                user = User.objects.get(id=django_user_id)
                logger.info(f"Authenticated with Django user ID {django_user_id} from query params")
                return (user, token)
            except User.DoesNotExist:
                logger.warning(f"User with ID {django_user_id} from query param not found")
                # Continue with normal authentication
        
        # First try Django's JWT token
        try:
            # Try to decode the JWT token
            from rest_framework_simplejwt.tokens import AccessToken
            from rest_framework_simplejwt.exceptions import TokenError
            
            try:
                # Validate the token
                validated_token = AccessToken(token)
                user_id = validated_token.get('user_id')
                
                if not user_id:
                    logger.warning("JWT token does not contain user_id")
                    return None
                    
                try:
                    user = User.objects.get(id=user_id)
                    logger.info(f"Authenticated with Django JWT for user {user.username}")
                    return (user, token)
                except User.DoesNotExist:
                    logger.warning(f"User with ID {user_id} from JWT token not found")
                    return None
                    
            except TokenError as e:
                # Not a valid Django JWT token, try Firebase next
                logger.info(f"Not a valid Django JWT token, trying Firebase: {str(e)}")
                
        except ImportError:
            # If simplejwt is not installed, continue to Firebase authentication
            logger.warning("simplejwt not installed")
            
        # Try Firebase token
        try:
            # Basic token validation - tokens have three segments
            if token.count('.') != 2:
                logger.warning("Token doesn't have 3 segments, not a JWT")
                return None
                
            # Decode the token payload (middle segment)
            import base64
            import json
            
            # Get the payload segment and fix padding
            payload = token.split('.')[1]
            padding = 4 - (len(payload) % 4)
            if padding < 4:
                payload += '=' * padding
                
            try:
                decoded_payload = json.loads(base64.b64decode(payload).decode('utf-8'))
                
                # Check if it has characteristics of a Firebase token
                if not ('iss' in decoded_payload and decoded_payload['iss'].endswith('securetoken.google.com')):
                    logger.warning("Not a Firebase token")
                    return None
                    
                # Extract Firebase UID
                firebase_uid = decoded_payload.get('user_id') or decoded_payload.get('sub') or decoded_payload.get('uid')
                email = decoded_payload.get('email', '')
                
                logger.info(f"Firebase token detected with UID: {firebase_uid}")
                
                if not firebase_uid:
                    logger.warning("Firebase token does not contain user ID")
                    return None
                
                # Try to find user with Firebase UID as username
                try:
                    user = User.objects.get(username=firebase_uid)
                    logger.info(f"Found user with Firebase UID as username: {user.id}")
                    return (user, token)
                except User.DoesNotExist:
                    pass
                
                # Try to find by email if available
                if email:
                    try:
                        user = User.objects.get(email=email)
                        logger.info(f"Found user with Firebase email: {user.id}")
                        return (user, token)
                    except User.DoesNotExist:
                        pass
                
                logger.warning(f"No user found for Firebase UID {firebase_uid}")
                return None
                    
            except Exception as e:
                logger.error(f"Error decoding Firebase token: {str(e)}")
                return None
                
        except Exception as e:
            logger.error(f"Error in Firebase authentication: {str(e)}")
            return None
            
        logger.warning("Authentication failed through all methods")
        return None
        
    def authenticate_header(self, request):
        return 'Bearer' 