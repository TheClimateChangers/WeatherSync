import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Rating } from '@mui/material';
import '../styles/YelpEvents.css';

// Weather-based category scoring system
const getCategoryScore = (category, weather) => {
    if (!weather || !weather.weather_conditions) return 0;

    const temp = weather.temperature;
    const rain = weather.rain_chance;
    const wind = weather.weather_conditions.wind_speed;

    // Base scores for different weather conditions
    const tempScores = {
        veryCold: { active: 0, arts: 10, food: 8, shopping: 10, beauty: 10, local: 5, tours: 5, nightlife: 10 },
        cold: { active: 3, arts: 10, food: 9, shopping: 9, beauty: 10, local: 7, tours: 7, nightlife: 10 },
        mild: { active: 10, arts: 10, food: 10, shopping: 8, beauty: 10, local: 10, tours: 10, nightlife: 10 },
        warm: { active: 8, arts: 10, food: 9, shopping: 6, beauty: 10, local: 8, tours: 8, nightlife: 10 },
        hot: { active: 2, arts: 10, food: 8, shopping: 7, beauty: 10, local: 6, tours: 6, nightlife: 10 }
    };

    const rainScores = {
        none: { active: 10, arts: 10, food: 10, shopping: 8, beauty: 10, local: 10, tours: 10, nightlife: 10 },
        light: { active: 5, arts: 10, food: 9, shopping: 9, beauty: 10, local: 8, tours: 7, nightlife: 10 },
        heavy: { active: 0, arts: 10, food: 8, shopping: 10, beauty: 10, local: 5, tours: 3, nightlife: 10 }
    };

    const windScores = {
        calm: { active: 10, arts: 10, food: 10, shopping: 10, beauty: 10, local: 10, tours: 10, nightlife: 10 },
        moderate: { active: 7, arts: 10, food: 10, shopping: 10, beauty: 10, local: 8, tours: 8, nightlife: 10 },
        strong: { active: 3, arts: 10, food: 10, shopping: 10, beauty: 10, local: 5, tours: 5, nightlife: 10 }
    };

    // Determine temperature category
    let tempCategory;
    if (temp < 5) tempCategory = 'veryCold';
    else if (temp < 15) tempCategory = 'cold';
    else if (temp < 25) tempCategory = 'mild';
    else if (temp < 30) tempCategory = 'warm';
    else tempCategory = 'hot';

    // Determine rain category
    let rainCategory;
    if (rain === 0) rainCategory = 'none';
    else if (rain < 5) rainCategory = 'light';
    else rainCategory = 'heavy';

    // Determine wind category
    let windCategory;
    if (wind < 5) windCategory = 'calm';
    else if (wind < 10) windCategory = 'moderate';
    else windCategory = 'strong';

    // Get category mapping
    const categoryMapping = {
        'Active & Outdoor': 'active',
        'Arts & Culture': 'arts',
        'Food & Drink': 'food',
        'Shopping': 'shopping',
        'Beauty': 'beauty',
        'Local Attractions': 'local',
        'Tours': 'tours',
        'Nightlife': 'nightlife'
    };

    const categoryKey = categoryMapping[category] || 'other';

    // Calculate weighted score (temperature: 40%, rain: 40%, wind: 20%)
    const tempScore = tempScores[tempCategory][categoryKey];
    const rainScore = rainScores[rainCategory][categoryKey];
    const windScore = windScores[windCategory][categoryKey];

    return (tempScore * 0.4 + rainScore * 0.4 + windScore * 0.2);
};

function YelpEvents({ events, weather }) {
    if (!events || events.length === 0) return null;

    // Sort events by weather suitability
    const sortedEvents = [...events].sort((a, b) => {
        const scoreA = getCategoryScore(a.categories[0], weather);
        const scoreB = getCategoryScore(b.categories[0], weather);
        return scoreB - scoreA;
    });

    return (
        <div className="events-container">
            <h2>Local Events</h2>
            <Grid container spacing={2}>
                {sortedEvents.map((event) => {
                    const weatherScore = getCategoryScore(event.categories[0], weather);
                    const scorePercentage = Math.round((weatherScore / 10) * 100);
                    
                    return (
                        <Grid item xs={12} sm={6} md={4} key={event.id}>
                            <Card className="event-card">
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {event.name}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {event.categories.join(', ')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Rating value={event.rating} readOnly precision={0.5} />
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            ({event.rating})
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {event.price}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {event.address}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {event.phone}
                                    </Typography>
                                    <div className="weather-suitability">
                                        <Typography variant="body2">
                                            Weather Suitability: {scorePercentage}%
                                        </Typography>
                                        <div className="suitability-bar">
                                            <div 
                                                className="suitability-fill"
                                                style={{ width: `${scorePercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </div>
    );
}

export default YelpEvents; 