#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

/**
 * Script de sincronização automática com GitHub
 * Executa formatação, linting, commit e push automaticamente
 */

function log(message) {
  console.log(`[AUTO-SYNC] ${new Date().toISOString()} - ${message}`)
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
      ...options,
    })
    return result.trim()
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`)
  }
}

function hasChanges() {
  try {
    const status = execCommand("git status --porcelain")
    return status.length > 0
  } catch (error) {
    log(`Error checking git status: ${error.message}`)
    return false
  }
}

function getCurrentBranch() {
  try {
    return execCommand("git branch --show-current")
  } catch (error) {
    log(`Error getting current branch: ${error.message}`)
    return "main"
  }
}

function formatCode() {
  try {
    log("Formatting code with Prettier...")
    execCommand("npm run format")
    log("Code formatting completed")
  } catch (error) {
    log(`Error formatting code: ${error.message}`)
    throw error
  }
}

function runLinter() {
  try {
    log("Running linter...")
    execCommand("npm run lint:fix")
    log("Linting completed")
  } catch (error) {
    log(`Linter warnings/errors: ${error.message}`)
    // Don't throw error for linter warnings, just log them
  }
}

function runTypeCheck() {
  try {
    log("Running type check...")
    execCommand("npm run type-check")
    log("Type check passed")
  } catch (error) {
    log(`Type check failed: ${error.message}`)
    throw error
  }
}

function commitAndPush() {
  try {
    const branch = getCurrentBranch()
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const commitMessage = `🔄 Auto-sync: ${timestamp}`

    log("Adding changes to git...")
    execCommand("git add .")

    log(`Committing changes: ${commitMessage}`)
    execCommand(`git commit -m "${commitMessage}"`)

    log(`Pushing to origin/${branch}...`)
    execCommand(`git push origin ${branch}`)

    log("Successfully pushed changes to remote repository")
  } catch (error) {
    log(`Error during commit/push: ${error.message}`)
    throw error
  }
}

async function main() {
  try {
    log("Starting auto-sync process...")

    // Check if there are any changes
    if (!hasChanges()) {
      log("No changes detected. Skipping sync.")
      return
    }

    log("Changes detected. Starting sync process...")

    // Format code
    formatCode()

    // Run linter
    runLinter()

    // Run type check
    runTypeCheck()

    // Check if there are still changes after formatting/linting
    if (!hasChanges()) {
      log("No changes after formatting/linting. Skipping commit.")
      return
    }

    // Commit and push
    commitAndPush()

    log("Auto-sync completed successfully! ✅")
  } catch (error) {
    log(`Auto-sync failed: ${error.message}`)
    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  main()
}

module.exports = { main, hasChanges, formatCode, runLinter, runTypeCheck, commitAndPush }
