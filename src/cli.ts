#!/usr/bin/env node
import fs from 'fs'
import { generateGraphqlTypes } from './graphql'
import { Command } from 'commander'
import { generateAmplienceSchemas } from './amplience'
import { readConfig, writeContentTypeToDir } from './amplience/io'

const watchIf = <T>(shouldWatch: boolean, files: string[], callback: () => T) =>
  shouldWatch ? files.forEach((file) => fs.watchFile(file, callback)) : callback()

const program = new Command()
program.version(require('../package.json').version)

program
  .command('graphql <inputFiles...>')
  .description('Generate GraphQL types')
  .option('-o, --output <file>', 'Write the output to the file.')
  .option('-w, --watch', 'Watch for changes')
  .action((inputFiles: string[], options) =>
    watchIf(options.watch, inputFiles, () =>
      options.output
        ? fs.writeFileSync(options.output, generateGraphqlTypes(inputFiles))
        : console.log(generateGraphqlTypes(inputFiles))
    )
  )

program
  .command('amplience <inputFiles...>')
  .description('Generate Amplience types')
  .option('-o, --output-dir <dir>', 'Write the output to JSON-files in <dir>.')
  .option('-w, --watch', 'Watch for changes')
  .option('-c, --config <yamlFile>', 'Use config file')
  .action((inputFiles: string[], options) =>
    watchIf(options.watch, inputFiles, () =>
      options.outputDir
        ? generateAmplienceSchemas(
            inputFiles,
            readConfig(options.config)
          ).forEach((contentTypeJsonFiles) =>
            writeContentTypeToDir(contentTypeJsonFiles, options.outputDir)
          )
        : console.log(
            JSON.stringify(
              generateAmplienceSchemas(inputFiles, readConfig(options.config)),
              null,
              2
            )
          )
    )
  )

program.parse(process.argv)
