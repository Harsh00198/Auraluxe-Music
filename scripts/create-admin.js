const mongoose = require("mongoose")
const User = require("../server/models/User")
require("dotenv").config()

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/auraluxe", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("✅ Connected to MongoDB")

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@auraluxe.com" })
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists")
      console.log("Email: admin@auraluxe.com")
      console.log("Password: admin123")
      console.log("Role:", existingAdmin.role)
      process.exit(0)
    }

    // Create admin user
    const adminUser = new User({
      username: "admin",
      email: "admin@auraluxe.com",
      password: "admin123",
      role: "admin",
      profile: {
        firstName: "Admin",
        lastName: "User",
        bio: "System Administrator",
      },
      preferences: {
        theme: "dark",
        volume: 0.7,
        autoplay: true,
        notifications: {
          email: true,
          push: true,
        },
      },
    })

    await adminUser.save()
    console.log("✅ Admin user created successfully!")
    console.log("Email: admin@auraluxe.com")
    console.log("Password: admin123")
    console.log("Role: admin")

    // Create a regular user for testing
    const regularUser = new User({
      username: "user",
      email: "user@auraluxe.com",
      password: "user123",
      role: "user",
      profile: {
        firstName: "Regular",
        lastName: "User",
        bio: "Regular user account",
      },
    })

    await regularUser.save()
    console.log("✅ Regular user created successfully!")
    console.log("Email: user@auraluxe.com")
    console.log("Password: user123")
    console.log("Role: user")

  } catch (error) {
    console.error("❌ Error creating admin user:", error)
  } finally {
    await mongoose.disconnect()
    console.log("✅ Disconnected from MongoDB")
    process.exit(0)
  }
}

createAdminUser()
