const pool = require('../config/db');

const validateServiceRequest = (req, res, next) => {
    // We now look for start and end times
    const { preferred_date, preferred_time_start, preferred_time_end, address } = req.body;

    if (!address || address.length < 10) {
        return res.status(400).json({ message: "Address is too short. Please provide full details." });
    }

    // Convert time strings (HH:MM) to comparable minutes from midnight
    const timeToMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };
    
    const startMinutes = timeToMinutes(preferred_time_start);
    const endMinutes = timeToMinutes(preferred_time_end);

    // 1. Validate Business Hours (08:00 - 18:00)
    // 8:00 AM = 480 min; 6:00 PM = 1080 min
    if (startMinutes < 480 || endMinutes > 1080) {
        return res.status(400).json({ message: "Bookings allowed only between 8:00 AM and 6:00 PM." });
    }

    // 2. Validate Start < End
    if (startMinutes >= endMinutes) {
        return res.status(400).json({ message: "Start time must be before end time." });
    }

    // 3. Block Past Dates/Times
    if (preferred_date && preferred_time_start) {
        const bookingStart = new Date(`${preferred_date}T${preferred_time_start}:00`);
        const now = new Date();

        if (bookingStart.getTime() <= now.getTime()) {
             return res.status(400).json({ message: "Cannot book for a time that has already passed." });
        }
    }

    // If all checks pass, attach data and move on
    req.validatedServiceRequest = req.body; 
    next();
};

module.exports = validateServiceRequest;