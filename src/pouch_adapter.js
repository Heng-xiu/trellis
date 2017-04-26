import PouchDB from 'pouchdb'

export default class PouchAdapter {
  constructor() {
    let remoteConfig = {
      auth: {
        username: process.env.CLOUDANT_USERNAME,
        password: process.env.CLOUDANT_PASSWORD
      }
    }

    this.db            = new PouchDB('trellis')
    this.remote        = new PouchDB('https://45bits.cloudant.com/trellis/', remoteConfig)
    this.docId         = "state"
    this.doc           = {}

    // Get or initialize a 'state' document in PouchDB
    this.db.get(this.docId).then((doc) => {
      this.doc = doc

      if(this.onLoad) this.onLoad(this.doc.state)
    }).catch((error) => {
      if(error.status === 404) {
        this.db.put({ _id: this.docId }).then((result) => {
          this.doc._rev = result.rev

          if(this.onLoad) this.onLoad(null)
        })
      } else {
        console.log(error)
      }
    })
  }

  setState(state) {
    this.doc.state = state

    this.db.put(this.doc, (err, result) => {
      if(err) console.log(err)
      this.doc._rev = result.rev
    })

    this.db.sync(this.remote)
  }

  resetState() {
    this.db.get(this.docId).then((doc) => {
      if(doc) {
        this.db.remove(doc).then((result) => {
          console.log("Cleared State")
        })
      }
    })
  }
}
