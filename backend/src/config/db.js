import mongoose from "mongoose";
import dns from 'node:dns';

export const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        throw new Error("MONGODB_URI is not defined");
    }

    try {
        const dnsServers = process.env.MONGODB_DNS_SERVERS
            ?.split(',')
            .map((server) => server.trim())
            .filter(Boolean);

        if (dnsServers?.length) {
            dns.setServers(dnsServers);
        }

        await mongoose.connect(mongoURI);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};
