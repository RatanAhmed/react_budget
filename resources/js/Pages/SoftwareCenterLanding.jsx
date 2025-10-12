import React from 'react';
import { motion } from 'framer-motion';

export default function SoftwareCenterLanding() {
  const services = [
    {
      title: 'Task Manager',
      description: 'Organize your daily activities, assign priorities, and stay productive effortlessly.',
      icon: '📋',
    },
    {
      title: 'Budget Planner',
      description: 'Track your income and expenses with smart insights for better financial control.',
      icon: '💰',
    },
    {
      title: 'Passport & Stamp Photo Maker',
      description: 'Create passport and stamp-size photos instantly with perfect sizing and clarity.',
      icon: '📸',
    },
    {
      title: 'Registration Service',
      description: 'Seamless registration management for various documents and digital services.',
      icon: '📝',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 shadow-sm bg-white sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-600">Software Center</h1>
        <nav className="space-x-6 hidden md:block">
          <a href="#services" className="hover:text-blue-600">Services</a>
          <a href="#about" className="hover:text-blue-600">About</a>
          <a href="#register" className="hover:text-blue-600">Register</a>
        </nav>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">Get Started</button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800"
        >
          All-in-One Digital Service Hub
        </motion.h2>
        <p className="max-w-2xl text-lg text-gray-600 mb-8">
          Manage tasks, plan budgets, create passport photos, and register services — all from one powerful platform.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg">Register Now</button>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-6 md:px-20 bg-white">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Services</h3>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-transform hover:scale-105"
            >
              <div className="text-5xl text-center mb-3">{service.icon}</div>
              <h4 className="text-lg font-semibold text-center mb-2">{service.title}</h4>
              <p className="text-gray-600 text-sm text-center">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-blue-50 text-center px-6">
        <h3 className="text-3xl font-bold mb-4">Why Choose Software Center?</h3>
        <p className="max-w-2xl mx-auto text-gray-700">
          We provide a wide range of smart tools that simplify your daily digital needs. Whether you’re managing a project, planning expenses, or preparing official documents — we’ve got you covered.
        </p>
        <div className="flex justify-center gap-4 mt-8 flex-wrap text-blue-600 font-medium">
          <div>✔ Easy to Use</div>
          <div>✔ Secure Platform</div>
          <div>✔ 24/7 Support</div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-20 px-6 bg-white text-center">
        <h3 className="text-3xl font-bold mb-6">Register Your Account</h3>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Create your Software Center account to access all services and manage everything from one dashboard.
        </p>
        <form className="max-w-md mx-auto bg-gray-50 p-6 rounded-2xl shadow-md">
          <input type="text" placeholder="Full Name" className="w-full mb-3 p-3 rounded-md border" required />
          <input type="email" placeholder="Email Address" className="w-full mb-3 p-3 rounded-md border" required />
          <input type="password" placeholder="Password" className="w-full mb-3 p-3 rounded-md border" required />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">Register Now</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-center py-6 mt-10">
        <p>© {new Date().getFullYear()} Software Center. All Rights Reserved.</p>
      </footer>
    </div>
  );
}