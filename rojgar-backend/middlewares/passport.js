const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Serialize user to store in session
passport.serializeUser((user, done) => {
    console.log("Serializing User:", user);
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        console.log("Deserializing User:", user);
        done(null, user);
    } catch (err) {
        console.error("Error during deserialization:", err.message);
        done(err, null);
    }
});

// Configure Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("Google Profile:", profile);
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    user = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    });
                    await user.save();
                }
                done(null, user);
            } catch (err) {
                console.error("Error in Google Strategy:", err.message);
                done(err, null);
            }
        }
    )
);
