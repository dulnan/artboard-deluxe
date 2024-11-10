import 'dotenv/config'
import { fileURLToPath } from 'url'
import path from 'path'
import crypto from 'crypto'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FILES = [
  'PPMondwest-Regular.woff2',
  'PPMondwest-Bold.woff2',
  'PPNeueBit-Regular.woff2',
  'PPNeueBit-Bold.woff2',
  'AllianceData.woff2',
]

const KEY = process.env.ASSETS_ENCRYPTION_KEY

if (!KEY) {
  throw new Error('Missing ASSETS_ENCRYPTION_KEY env variable.')
}

// AES block size.
const IV_LENGTH = 16

// Derive key from the secret key (must be 32 bytes for AES-256).
const derivedKey = crypto
  .createHash('sha256')
  .update(KEY)
  .digest('base64')
  .substring(0, 32)

function getHashedFileName(fileName) {
  return crypto.createHash('md5').update(fileName).digest('hex')
}

async function encrypt(fileName) {
  const sourcePath = path.join(__dirname, 'source', fileName)
  const sourceData = await fs.promises.readFile(sourcePath)

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv)

  let encryptedData = Buffer.concat([cipher.update(sourceData), cipher.final()])
  const dataToWrite = Buffer.concat([iv, encryptedData])

  const hashedFileName = getHashedFileName(fileName)
  const outputPath = path.join(__dirname, 'encrypted', hashedFileName)
  await fs.promises.writeFile(outputPath, dataToWrite)
}

async function decrypt(fileName) {
  const hashedFileName = getHashedFileName(fileName)
  const encryptedPath = path.join(__dirname, 'encrypted', hashedFileName)
  const encryptedData = await fs.promises.readFile(encryptedPath)

  const iv = encryptedData.slice(0, IV_LENGTH)
  const encrypted = encryptedData.slice(IV_LENGTH)

  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv)

  let decryptedData = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  const outputPath = path.join(
    __dirname,
    './../../website/assets/fonts/licensed-fonts/',
    fileName,
  )
  await fs.promises.writeFile(outputPath, decryptedData)
}

async function main() {
  const command = process.argv[2] // "encrypt" or "decrypt"
  if (command !== 'encrypt' && command !== 'decrypt') {
    console.error('Invalid command. Use "encrypt" or "decrypt".')
    process.exit(1)
  }

  for (const fileName of FILES) {
    if (command === 'encrypt') {
      await encrypt(fileName)
      console.log(`${fileName} encrypted successfully.`)
    } else if (command === 'decrypt') {
      await decrypt(fileName)
      console.log(`${fileName} decrypted successfully.`)
    }
  }
}

main()
