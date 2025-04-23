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
        # Get the auth header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        # Debug logging
        logger.info(f"Authenticating request to {request.path} with auth header: {auth_header[:10]}...")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Query params: {request.GET}")
        
        if not auth_header.startswith('Bearer '):
            logger.warning(f"Auth header doesn't start with 'Bearer': {auth_header[:20]}")
            return None
            
        token = auth_header.split(' ')[1]
        
        if not token:
            logger.warning("No token in auth header")
            return None
            
        logger.info(f"Token received: {token[:20]}...")
        
        # First try Django's JWT token
        try:
            # Try to decode the JWT token
            from rest_framework_simplejwt.tokens import AccessToken
            from rest_framework_simplejwt.exceptions import TokenError
            
            try:
                # Validate the token
                validated_token = AccessToken(token)
                user_id = validated_token.get('user_id')
                
                logger.info(f"JWT token decoded, user_id: {user_id}")
                
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
                logger.info(f"Not a valid Django JWT token: {str(e)}")
                pass
                
        except ImportError:
            # If simplejwt is not installed, continue to Firebase authentication
            logger.warning("simplejwt not installed")
            pass
        
        # Try Firebase token
        try:
            # Basic token validation - Firebase tokens have three segments separated by dots
            if token.count('.') != 2:
                logger.warning(f"Token doesn't have 3 segments: {token[:20]}...")
                return None
                
            # Decode the token payload (middle segment)
            import base64
            import json
            
            # Get the payload segment and fix padding
            payload = token.split('.')[1]
            # Add padding if needed
            padding = 4 - (len(payload) % 4)
            if padding < 4:
                payload += '=' * padding
                
            try:
                decoded_payload = json.loads(base64.b64decode(payload).decode('utf-8'))
                logger.info(f"Decoded token payload: {decoded_payload}")
                
                # Check if it has characteristics of a Firebase token
                if not ('iss' in decoded_payload and decoded_payload['iss'].endswith('securetoken.google.com')):
                    logger.warning(f"Not a Firebase token: {decoded_payload.get('iss', 'no issuer')}")
                    return None
                    
                # Extract Firebase UID
                firebase_uid = decoded_payload.get('user_id') or decoded_payload.get('sub') or decoded_payload.get('uid')
                logger.info(f"Firebase UID from token: {firebase_uid}")
                
                if not firebase_uid:
                    logger.warning("Firebase token does not contain user ID")
                    return None
                
                # Check if we have a Django user ID in query parameters
                django_user_id = request.GET.get('django_user_id')
                logger.info(f"Django user ID from query params: {django_user_id}")
                
                if django_user_id:
                    logger.info(f"Found Django user ID in query parameters: {django_user_id}")
                    try:
                        user = User.objects.get(id=django_user_id)
                        logger.info(f"Authenticated with Django user ID from query parameter for Firebase user {firebase_uid}")
                        return (user, token)
                    except User.DoesNotExist:
                        logger.warning(f"User with ID {django_user_id} from query parameter not found")
                        # Continue with other authentication methods
                    
                # Find user with this Firebase UID as username
                try:
                    user = User.objects.get(username=firebase_uid)
                    logger.info(f"Authenticated with Firebase for user {user.username}")
                    return (user, token)
                except User.DoesNotExist:
                    logger.warning(f"User with Firebase UID {firebase_uid} as username not found")
                    # Try to find by email
                    email = decoded_payload.get('email')
                    logger.info(f"Trying to find user by email: {email}")
                    if email:
                        try:
                            user = User.objects.get(email=email)
                            logger.info(f"Authenticated with Firebase email for user {user.username}")
                            return (user, token)
                        except User.DoesNotExist:
                            logger.warning(f"User with email {email} not found")
                            pass
                    
                    logger.warning(f"User with Firebase UID {firebase_uid} not found through any method")
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