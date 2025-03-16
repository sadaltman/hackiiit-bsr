#!/bin/bash

# Initialize Git repository
git init

# Add all files to Git
git add .

# Initial commit
git commit -m "Initial commit: College Marketplace MERN Application"

echo "Git repository initialized successfully!"
echo ""
echo "To push to GitHub, run the following commands:"
echo "git remote add origin https://github.com/yourusername/college-marketplace.git"
echo "git push -u origin main"
echo ""
echo "Replace 'yourusername' with your actual GitHub username and 'college-marketplace' with your repository name." 