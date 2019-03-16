const util = require('util')
const bsv = require('bsv')
const Mnemonic = require('bsv/Mnemonic')

/*
// generate mnemonic
const crypto = require('crypto')
let m = new Mnemonic(crypto.randomBytes(16)) // use your own entropy >= 128 bit
let m = new Mnemonic() // random
*/

// recover from mnemonic
let m = new Mnemonic('universe buyer pony veteran swap collect old suit relax obscure begin suggest')
console.log('mnemonic:')
console.log(m.toString()) // universe buyer pony veteran swap collect old suit relax obscure begin suggest
console.log('')

// bip 39 passphrase, derivation path
let passphrase = '' // optional
let path = "m/44'/145'/0'" // btc: m/44'/0'/0', bch: m/44'/145'/0', bsv: m/44'/236'/0'

// account extended private key
let xprv = m.toHDPrivateKey(passphrase).deriveChild(path)
console.log('xprv:')
console.log(xprv.toString()) // xprv9xkSJ2ZwSW3eiGFcfrBEW2Bqyt9JNKT1FZaY3rJffMxFPpKnKGw3wE1p93oZnkHJvBrCitpaBi6mRjZMijtEjBVGLVomGZd9PkhUuhVMpv7
console.log('')

// account extended public key
let xpub = xprv.hdPublicKey
console.log('xpub:')
console.log(xpub.toString()) // xpub6BjnhY6qGsbwvkL5msiEsA8aXuynmnArcnW8rEiHDhVEGcevrpFJV2LHzJtMM3G6vhyEWdvAg3dEstS9CtUHkBV5cj3oa5LAfMba8dc2CkA
console.log('')

// derive receive addresses from xpub
let receiveAddress0 = xpub.deriveChild(0).deriveChild(0).publicKey.toAddress().toString()
let receiveAddress1 = xpub.deriveChild(0).deriveChild(1).publicKey.toAddress().toString()
let receiveAddress2 = xpub.deriveChild(0).deriveChild(2).publicKey.toAddress().toString()
console.log('receive addresses:')
console.log(path + "/0/0", receiveAddress0) // m/44'/145'/0'/0/0 163QueGn7taDgWfyQKgXMHBZ14iu9QKxZA
console.log(path + "/0/1", receiveAddress1) // m/44'/145'/0'/0/1 1YjsJQuLGm7G4pqyeVE2P458UgK2CLdYj
console.log(path + "/0/2", receiveAddress2) // m/44'/145'/0'/0/2 1rPznNhoxEaHJhUdtp5ePPwoGryNMh6SW
console.log('')

// derive address from xprv
let derivedFromXPRV = xprv.deriveChild(0).deriveChild(0).publicKey.toAddress().toString()
console.log('derived from xprv:')
console.log(receiveAddress0 === derivedFromXPRV) // true
console.log('')

// generate address from WIF
let receiveAddress0WIF = xprv.deriveChild(0).deriveChild(0).privateKey.toWIF()
let generatedFromWIF = new bsv.PrivateKey(receiveAddress0WIF).publicKey.toAddress().toString()
console.log('generated from wif:')
console.log(receiveAddress0 === generatedFromWIF) // true
console.log('')

// derive change addresses from xpub, xprv
let changeAddress0 = xpub.deriveChild(1).deriveChild(0).publicKey.toAddress().toString()
let changeAddress1 = new bsv.HDPublicKey(xpub.toString()).deriveChild(1).deriveChild(1).publicKey.toAddress().toString()
let changeAddress2 = new bsv.HDPrivateKey(xprv.toString()).deriveChild(1).deriveChild(2).publicKey.toAddress().toString()
console.log('change addresses:')
console.log(path + "/1/0", changeAddress0) // m/44'/145'/0'/1/0 16Jne8X7PY3TekYHPT3Z1ZwDgmvY6kqZYp
console.log(path + "/1/1", changeAddress1) // m/44'/145'/0'/1/1 1GqEo2yYL5LPh8ZmGUMwjRPtAUepMmvJoz
console.log(path + "/1/2", changeAddress2) // m/44'/145'/0'/1/2 1AXAkdHn1GxPGpzKrpjiSJWdK8AgKAqYCd
console.log('')

// available unspent transaction outputs
let utxos = [
  { // receiveAddress2 (1rPznNhoxEaHJhUdtp5ePPwoGryNMh6SW) unspent transaction output
    // https://whatsonchain.com/tx/08d6e5cf227135d8bb0adb801e1466eb25aaad456318d597be365dcd3a5cd185
    txId: '08d6e5cf227135d8bb0adb801e1466eb25aaad456318d597be365dcd3a5cd185',
    outputIndex: 1,
    satoshis: 20000,
    script: 'OP_DUP OP_HASH160 20 0x09579413d7b9d98373fc35fdd29ddd4b51c608af OP_EQUALVERIFY OP_CHECKSIG' // receiveAddress2 p2pkh script in opcode format
  },
  { // receiveAddress1 (1YjsJQuLGm7G4pqyeVE2P458UgK2CLdYj) unspent transaction output
    // https://whatsonchain.com/tx/3ec5ea76ec74dbc518e87cd2bea16b6c0a9b2a2c4876c8bbf491b74dcde7e1e1
    txId: '3ec5ea76ec74dbc518e87cd2bea16b6c0a9b2a2c4876c8bbf491b74dcde7e1e1',
    outputIndex: 0,
    satoshis: 10000,
    script: '76a9140600adb80ae859fc6fe08071ab671733ac5795e888ac' // receiveAddress1 p2pkh script in hex format
  }
]
console.log('script/address conversion:')
console.log(new bsv.Script(utxos[1].script).toAddress().toString() === receiveAddress1) // true
console.log(new bsv.Script(new bsv.Address(receiveAddress2)).toString() === utxos[0].script) // true
console.log('')

// define transaction outputs
let availableAmount = utxos.reduce((acc, curr) => acc + curr.satoshis, 0)
let sendAmount = 25000
let fee = 149 * utxos.length + 34 * 2 + 10 // 149 * no. of inputs + 34 * no. of outputs + 10
let changeAmount = availableAmount - sendAmount - fee
let recipientAddress = '1E6xkZqEKid3ffhyPvweZXeXu1ixMqKbko'
let outputs = [
  { address: recipientAddress, satoshis: sendAmount },
  { address: changeAddress0, satoshis: changeAmount }
]

// create transaction
let tx = new bsv.Transaction().from(utxos).to(outputs)

// sign transaction with available private keys
let keys = [
  xprv.deriveChild(0).deriveChild(0).privateKey, // receiveAddress0 private key (not required)
  xprv.deriveChild(0).deriveChild(1).privateKey, // receiveAddress1 private key (required)
  xprv.deriveChild(0).deriveChild(2).privateKey, // receiveAddress2 private key (required)
  xprv.deriveChild(1).deriveChild(0).privateKey, // changeAddress0 private key (not required)
  xprv.deriveChild(1).deriveChild(1).privateKey, // changeAddress1 private key (not required)
  xprv.deriveChild(1).deriveChild(2).privateKey  // changeAddress2 private key (not required)
]
tx.sign(keys)

// summary
// https://whatsonchain.com/tx/798db450cf6eb6823043d87d5fa684bcb32ad7641eb2ff80161b9d60f5bbc663
let txId = tx.hash
let txHex = tx.serialize()
let txSize = txHex.length / 2
let feeRate = fee / txSize
console.log('transaction id:')
console.log(txId)
console.log('')
console.log('sat/byte:')
console.log(feeRate)
console.log('')
console.log('raw transaction:')
console.log(txHex)
console.log('')
console.log('transaction object:')
console.log(util.inspect(tx.toObject(), { depth: null }))

/*
transaction id:
798db450cf6eb6823043d87d5fa684bcb32ad7641eb2ff80161b9d60f5bbc663

sat/byte:
1.0080428954423593

raw transaction:
010000000285d15c3acd5d36be97d5186345adaa25eb66141e80db0abbd8357122cfe5d608010000006b483045022100d8bd91f4f6fc7fda9a08dd1969fa22ba9e82e2b54e9c94940c81c2c24ce43bd70220368b42d1b732f254521d79edf06a687f241cbd1ea9c540a15e9ae5a241cb50bf4121027cc8a72757c48c40c5a790beb27385b41e3462d0102cbf3df81495698c4d049fffffffffe1e1e7cd4db791f4bbc876482c2a9b0a6c6ba1bed27ce818c5db74ec76eac53e000000006a47304402203bbd98547e1021eea2574172882b9ce1d119e2d4ca7b09e0180c94b3ce9869d302206c2273ab6004b2c17573c717bf1a01c9273ec16cad75915c53f3e6c2078c20ca412103e64cd0c104008ab6012750cba1cdb89d0b294f56f7f8d19563b054049f1814deffffffff02a8610000000000001976a9148fba40f2d310f391818367d5218faa412151fa1e88ac10120000000000001976a9143a35cc7ba11ae6944c4d972554cb7ddf114524fe88ac00000000

transaction object:
{ hash: '798db450cf6eb6823043d87d5fa684bcb32ad7641eb2ff80161b9d60f5bbc663',
  version: 1,
  inputs:
   [ { prevTxId: '08d6e5cf227135d8bb0adb801e1466eb25aaad456318d597be365dcd3a5cd185',
       outputIndex: 1,
       sequenceNumber: 4294967295,
       script: '483045022100d8bd91f4f6fc7fda9a08dd1969fa22ba9e82e2b54e9c94940c81c2c24ce43bd70220368b42d1b732f254521d79edf06a687f241cbd1ea9c540a15e9ae5a241cb50bf4121027cc8a72757c48c40c5a790beb27385b41e3462d0102cbf3df81495698c4d049f',
       scriptString: '72 0x3045022100d8bd91f4f6fc7fda9a08dd1969fa22ba9e82e2b54e9c94940c81c2c24ce43bd70220368b42d1b732f254521d79edf06a687f241cbd1ea9c540a15e9ae5a241cb50bf41 33 0x027cc8a72757c48c40c5a790beb27385b41e3462d0102cbf3df81495698c4d049f',
       output:
        { satoshis: 20000,
          script: '76a91409579413d7b9d98373fc35fdd29ddd4b51c608af88ac' } },
     { prevTxId: '3ec5ea76ec74dbc518e87cd2bea16b6c0a9b2a2c4876c8bbf491b74dcde7e1e1',
       outputIndex: 0,
       sequenceNumber: 4294967295,
       script: '47304402203bbd98547e1021eea2574172882b9ce1d119e2d4ca7b09e0180c94b3ce9869d302206c2273ab6004b2c17573c717bf1a01c9273ec16cad75915c53f3e6c2078c20ca412103e64cd0c104008ab6012750cba1cdb89d0b294f56f7f8d19563b054049f1814de',
       scriptString: '71 0x304402203bbd98547e1021eea2574172882b9ce1d119e2d4ca7b09e0180c94b3ce9869d302206c2273ab6004b2c17573c717bf1a01c9273ec16cad75915c53f3e6c2078c20ca41 33 0x03e64cd0c104008ab6012750cba1cdb89d0b294f56f7f8d19563b054049f1814de',
       output:
        { satoshis: 10000,
          script: '76a9140600adb80ae859fc6fe08071ab671733ac5795e888ac' } } ],
  outputs:
   [ { satoshis: 25000,
       script: '76a9148fba40f2d310f391818367d5218faa412151fa1e88ac' },
     { satoshis: 4624,
       script: '76a9143a35cc7ba11ae6944c4d972554cb7ddf114524fe88ac' } ],
  nLockTime: 0 }
*/
