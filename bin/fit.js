#!/usr/bin/env node
const fs    = require("fs")
const yargs = require('yargs')
                .usage(`Usage: $0 [target-dir]`)
                .help()
                .alias('h', 'help')

const argv       = yargs.argv;
const cwd        = process.cwd()
const targetDirs = argv._.length ? argv._ : [cwd]

const prefix     = require('@tybys/find-npm-prefix').findPrefixSync(cwd)
const projectDir = prefix + '/node_modules/direzione'

const package = JSON.parse(fs.readFileSync(
    projectDir + '/package.json', { encoding: 'utf8', flag: 'r' }
))

targetDirs.forEach((dirname) => {
    try {
        if (!fs.existsSync(dirname)) throw( 'No such directory: ' + dirname )

        var stats = fs.statSync(dirname);
        if (!stats.isDirectory()) { throw( dirname + ' is not a directory ' ) }

        if (prefix === dirname)
            createSymlinks(dirname)
        else
            createCopies(dirname)
    } catch(err) {
        console.error(err)
    }
})


function getAllContainingFilePaths(dirpath) {
    var files = []

    fs.readdirSync(projectDir + '/' + dirpath).forEach((filename) => {
        var path = stripTrailingSlash(dirpath) + '/' + filename;
        var stats = fs.statSync(projectDir + '/' + path);
        if (stats.isDirectory()) files = files.concat(getAllContainingFilePaths(path))
        else files.push(path)
    })

    return files
}


function stripTrailingSlash(path) {
    return path.endsWith('/') ? path.slice(0, -1) : path
}


function getPathsToFilesRecursive(paths) {
    var result = []

    paths.forEach((filename) => {
        var stats = fs.statSync(projectDir + '/' + filename);
        if (stats.isDirectory()) {
            result = result.concat(getAllContainingFilePaths(filename))
        } else {
            result.push(filename)
        }
    })

    getPathsToFilesRecursive = () => {
        return result
    }

    return result
}


function createSymlinks(dirname) {
    var paths  = getPathsToFilesRecursive(package.files)
    dirname    = stripTrailingSlash(dirname)

    paths.forEach((path) => {
        var segments = path.split('/')

        if (1 < segments.length) {
            var p = segments.slice(0, -1).join('/')
            fs.mkdirSync(dirname + '/' + p, {recursive:true}, (err) => {
                if (err && err.code !== 'EEXIST') console.error(err)
            })
        }

        fs.symlink(
            projectDir + '/' + path,
            dirname + '/' + path,
            (err) => {
                if (err && err.code !== 'EEXIST') console.error(err)
            }
        )
    })
}


function createCopies(dirname) {
    var paths  = getPathsToFilesRecursive(package.files)
    dirname    = stripTrailingSlash(dirname)

    paths.forEach((path) => {
        var segments = path.split('/')

        if (1 < segments.length) {
            var p = segments.slice(0, -1).join('/')
            fs.mkdirSync(dirname + '/' + p, {recursive:true}, (err) => {
                if (err && err.code !== 'EEXIST') console.error(err)
            })
        }

        fs.copyFileSync(projectDir + '/' + path, dirname + '/' + path)

        if (path.endsWith('.html')) {
            fs.readFile(dirname + '/' + path, 'utf-8', function (err, contents) {
                if (err) {
                  console.log(err);
                  return;
                }

                const replaced = contents.replaceAll('node_modules/', prefix + '/node_modules/');

                fs.writeFile(dirname + '/' + path, replaced, 'utf-8', function (err) {
                    if (err) console.log(err);
                });
            });
        }
    })
}
