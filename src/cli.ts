#!/usr/bin/env node
import fs from 'fs'
import { generateGraphqlTypes } from './graphql'
import { Command } from 'commander'
import { generateJson } from './amplience'

const logOrWrite = (result: string, outputFile?: string) =>
  outputFile ? fs.writeFileSync(outputFile, result) : console.log(result)

const program = new Command()
program.version('0.0.1')

program
  .command('graphql <inputFiles...>')
  .description('Generate GraphQL types')
  .option('-o, --output <file>', 'Write the output to the file.')
  .action((inputFiles: string[], options) =>
    logOrWrite(generateGraphqlTypes([...inputFiles]), options.output)
  )

program
  .command('amplience <inputFiles...>')
  .description('Generate Amplience types')
  .option('-o, --output <file>', 'Write the output to the file.')
  .action((inputFiles: string[], options) =>
    logOrWrite(JSON.stringify(generateJson([...inputFiles]), null, 2), options.output)
  )

program.parse(process.argv)
