import React from 'react';
import '../styles/YelpEvents.css';

function YelpEvents({ events }) {
    if (!events || events.length === 0) return null;

    return (
        <div className="yelp-events">
            <h3>Local Activities</h3>
            <div className="events-list">
                {events.map((event) => (
                    <div key={event.id} className="event-card">
                        <h4>{event.name}</h4>
                        <p className="rating">Rating: {event.rating} ⭐</p>
                        <p className="address">{event.address}</p>
                        {event.phone && <p className="phone">{event.phone}</p>}
                        {event.url && (
                            <a href={event.url} target="_blank" rel="noopener noreferrer">
                                View on Yelp
                            </a>
                        )}
                        {event.image_url && (
                            <img src={event.image_url} alt={event.name} className="event-image" />
                        )}
                        {event.categories && event.categories.length > 0 && (
                            <p className="categories">
                                Categories: {event.categories.join(', ')}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default YelpEvents; 