#!/usr/bin/env node

require('..')
const Module = require('module')
const path = require('path')

function printHelp () {
  console.log(`
Usage: asar-node [options] [arguments]
Options:
  -r, --require [path]           Require a node module before execution
  -h, --help                     Print CLI usage
  -v, --version                  Print module version information
`)
}

function main (argc, argv) {
  const args = argv.slice(2)

  if (args[0] === '-h' || args[0] === '--help') {
    printHelp()
    return
  }

  if (args[0] === '-v' || args[0] === '--version') {
    console.log('node: ' + process.version)
    console.log('asar-node: v' + require('../package.json').version)
    return
  }

  const options = {
    '-r': String,
    '--require': String
  }

  const preloadRequests = []

  let i = 0

  for (i = 0; i < argc; i++) {
    if (typeof args[i] === 'string' && args[i][0] === '-') {
      if (args[i] in options) {
        if (options[args[i]] === Boolean) {
          process.execArgv.push(args[i])
        } else {
          process.execArgv.push(args[i])
          if (typeof args[i + 1] !== 'string') {
            printHelp()
            return
          }
          process.execArgv.push(args[i + 1])
          if (args[i] === '-r' || args[i] === '--require') {
            preloadRequests.push(args[i + 1])
          }
          i++
        }
      } else {
        console.log('asar-node: bad option: ' + args[i])
        return
      }
    } else {
      break
    }
  }

  if (!args[i]) {
    if (process.stdin.isTTY) {
      require('repl').start({
        prompt: '> ',
        input: process.stdin,
        output: process.stdout,
        terminal: process.stdout.isTTY,
        useColors: true,
        useGlobal: true
      })
    } else {
      printHelp()
    }
    return
  }

  process.argv = [argv[0], path.isAbsolute(args[i]) ? args[i] : path.join(process.cwd(), args[i]), ...args.slice(i + 1)]

  Module._preloadModules(preloadRequests)
  Module.runMain()
}

main(process.argv.length, process.argv)
