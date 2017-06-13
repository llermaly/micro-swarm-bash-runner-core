import WebSocket from 'ws'
import url from 'url'
import fetch from 'isomorphic-fetch'

import formData from 'form-data'

import snodes from '../snodes'

import params from '../params'

let sockets = {}

let ress = {}

let nexts = {}

let lastSocket = null

const wss = new WebSocket.Server({ port: params.WS_PORT })

const check_login = (req) => {
  const { id, secret } = url.parse(req.url, true).query

  let res = false

  snodes.forEach((n) => {
    if(n.id == id && n.secret == secret) {
      res = n
    }
  })
  return res
}

const addSocket = (s, n) => {
  s.id = n.id
  sockets[n.id] = s

  s.on('close', () => {
    delete sockets[s.id]
  })
  s.on('error', () => {
    delete sockets[s.id]
  })

  console.log(`Socket '${s.id}' auth succeed`)
}

const delSocket = (id) => {
  delete sockets[id]
}

const startSwarm = () => {
  wss.on('connection', (ws, req) => {
    ws.on('message', handle_incoming_message)
    let logged = check_login(req)
    if(logged) {
      addSocket(ws, logged)
    }
    else {
      ws.close()
      return
    }
  })
}

const handle_incoming_message = (omsg) => {
  let msg = JSON.parse(omsg)
  let form = new formData
  if(msg.action == 'cert_created') {
    let res = ress[msg.accountName]
    let next = nexts[msg.accountName]
    if (res) {
      res.status(200)
      res.json({
        status: 200,
        message: 'Message propagated to the swarm.',
        cert: msg.payload
      })
      res.end()
      return next()
    }
    form.append('accountName', msg.accountName)
    form.append('cert', msg.payload)
    fetch(params.submitUrl, {
      method: 'POST',
      body: form
    }).then((response) => {
      return response.text()
    }).then((response_text) => {
      //console.log(response_text)
    })
  }
  if(msg.action == 'get_connected_users') {
    let res = ress[msg.connected_users]
    let next = nexts[msg.connected_users]
    if (res) {
      res.status(200)
      res.json({
        status: 200,
        message: 'Message propagated to the swarm.',
        connected_users: msg.connected_users
      })
      res.end()
      return next()
    }
  }
}

const getConnectedUsers = (node_id) => {
  sockets[node_id].send(composeConnectedUsers(node_id))
}

const deleteBroadcast = (accountName) => {
  Object.keys(sockets).forEach((s) => {
    sockets[s].send(composeDelete(accountName))
  })
}

const deleteSingle = (accountName, node_id) => {
  sockets[node_id].send(composeDelete(accountName))
}

const createSingle = (accountName, res, next) => {
  ress[accountName] = res
  nexts[accountName] = next
  /* wea fea */
  if(lastSocket == null || Object.keys(sockets)[Object.keys(sockets).length - 1] == lastSocket) {
    lastSocket = Object.keys(sockets)[0]
  }
  else {
    lastSocket = Object.keys(sockets)[(Object.keys(sockets).indexOf(lastSocket)) + 1]
  }
  if(Object.keys(sockets).length == 0) {
    console.log('Se estan tratando de agregar usuarios sin ningun nodo conectado!')
    return
  }

  sockets[lastSocket].send(composeCreate(accountName, lastSocket))

}

const createSingleInNode = (accountName,node, res, next) => {
  ress[accountName] = res
  nexts[accountName] = next

  sockets[node].send(composeCreate(accountName, node))

}

const composeConnectedUsers = (ls) => {
  return JSON.stringify({
    action: 'get_connected_users',
    node_id: ls
  })
}

const composeDelete = (accountName) => {
  return JSON.stringify({
    action: 'delete_user',
    accountName
  })
}

const composeCreate = (accountName, ls) => {
  return JSON.stringify({
    action: 'create_user',
    accountName,
    node_id: ls
  })
}



export { startSwarm, deleteBroadcast, deleteSingle, createSingle,createSingleInNode, getConnectedUsers  }