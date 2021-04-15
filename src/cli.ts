#!/usr/bin/env node
import fs from 'fs'
import { generateGraphqlTypes } from './graphql'
import { Command } from 'commander'
import { generateAmplienceSchemas } from './amplience'
import { readConfig, writeContentTypeToDir } from './amplience/io'
import { importContentItems, test } from './amplience-migrate/client'

const watchIf = <T>(shouldWatch: boolean, files: string[], callback: () => T) =>
  shouldWatch ? files.forEach((file) => fs.watchFile(file, callback)) : callback()

const program = new Command()
const version = JSON.parse(
  fs.readFileSync(fs.existsSync('package.json') ? 'package.json' : '../package.json', 'utf-8')
).version
program.version(version)

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

program
  .command('amplience-import <dir>')
  .description('Generate Amplience types')
  .action((dir: string) => importContentItems(dir))

// program
//   .command('test')
//   .description('Test')
//   .action(() => test())

program.parse(process.argv)
