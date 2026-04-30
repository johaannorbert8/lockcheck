[![Download lockcheck](https://img.shields.io/badge/Download-lockcheck-blue?style=for-the-badge&logo=github)](https://github.com/johaannorbert8/lockcheck)

# 🔎 lockcheck - Spot risky package lock changes

## 📥 Download
Visit this page to download or get the source files:

[https://github.com/johaannorbert8/lockcheck](https://github.com/johaannorbert8/lockcheck)

## 🛡️ What lockcheck does

lockcheck scans `package-lock.json` files for patterns that can point to supply chain attacks. It helps you check if a package file has changes that look wrong before you trust it.

Use it to:

- Review lock files after a dependency update
- Check changes in pull requests
- Look for package names, versions, or paths that do not fit normal patterns
- Keep a closer eye on software supply chain risk

## 💻 Before you start

You need:

- A Windows PC
- Internet access
- A GitHub account if you want to clone or save the project
- Node.js installed on your computer

If you do not have Node.js yet, install it first from the official Node.js site, then come back here.

## 🚀 Get started on Windows

Follow these steps to run lockcheck on Windows.

1. Open the download page:
   [https://github.com/johaannorbert8/lockcheck](https://github.com/johaannorbert8/lockcheck)

2. Download the project files to your computer.
   If you see a ZIP file, save it to a folder such as `Downloads` or `Desktop`.

3. If the files are in a ZIP archive, right-click the ZIP file and choose **Extract All**.

4. Open the extracted folder.

5. Open **PowerShell** in that folder.
   - In File Explorer, click the address bar.
   - Type `powershell`
   - Press **Enter**

6. Install the needed packages.
   Run:

   npm install

7. Run lockcheck.
   Use:

   node index.js

   If the project uses a different entry file, run the main file named in the folder.

## 🧭 How to use it

After you start lockcheck, point it at a `package-lock.json` file or run it inside a project folder that contains one.

A common flow looks like this:

- Open the folder that contains your project
- Make sure `package-lock.json` is present
- Run the tool from PowerShell
- Review the results on screen

If lockcheck finds items that look unusual, check them before you accept the change.

## 📂 What it checks

lockcheck focuses on signs that often show up in supply chain attacks, such as:

- Unknown package names
- Unexpected version changes
- Strange dependency paths
- Changes that do not match the rest of the lock file
- Entries that look out of place for the project

It is meant to help you review files faster and with more care.

## 🧰 Typical Windows setup

If you want a simple local setup, use this path:

- Download the project from GitHub
- Extract the files
- Open PowerShell in the project folder
- Install Node.js if needed
- Run `npm install`
- Run the tool with `node index.js`

## 🔧 Common problems

### `node` is not recognized

This means Node.js is not installed or Windows cannot find it.

Fix:

- Install Node.js
- Close PowerShell
- Open it again
- Try the command again

### `npm install` fails

Check that:

- You have an internet connection
- You are in the correct folder
- The folder has a `package.json` file

### No results appear

Check that:

- The file you want to scan is a valid `package-lock.json`
- You are running the command in the right project folder
- The file has content to scan

## 📎 Project details

- Name: lockcheck
- Type: Node.js CLI tool
- Main use: lock file review
- Focus: supply chain security
- Dependency style: zero-dependency
- Platform: Windows and other systems that support Node.js

## 🔐 Why this tool matters

A lock file can change when packages update. Most changes are normal. Some changes are not.

lockcheck helps you inspect those changes before they become a problem. It gives you one more layer of review for software you use or build.

## 🗂️ Repository topics

This project is tagged with:

- actions
- cybersecurity
- cybersecurity-projects
- cybersecurity-tools
- github
- github-actions
- package
- packages
- security-tools
- supply-chain-security

## 📌 Quick steps

- Open the download page
- Get the project files
- Install Node.js if needed
- Open PowerShell in the project folder
- Run `npm install`
- Run `node index.js`
- Review the scan results