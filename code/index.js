import restify from 'restify'
import grpc from 'grpc'

import { startSwarm, deleteBroadcast, deleteSingle, createSingle } from './ws_swarm'

import snodes from './snodes' 

const PORT = process.env.PORT || 3000

startSwarm()

const server = restify.createServer({
  name: 'micro-swarm-bash-runner-core',
  version: '0.0.1'
})


server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.get('/', (req, res, next) => {
  res.send({
    name: server.name,
    version: server.version
  })
})

server.get('/create/:id', (req, res, next) => {
  
  if(req.params.id.length > 0) {
    createSingle(req.params.id.length)
    res.status(200)
    res.json({
      status: 200,
      message: 'Message propagated to the swarm.'
    })
  }
  else {
    res.status(404)
    res.json({
      status: 404,
      message: 'Error: accountName missing.'
    })
  }

  res.end()
  return next()
})

server.get('/delete/:id', (req, res, next) => {
  if(req.params.id.length > 0) {
    deleteBroadcast(req.params.id)
    res.status(200)
    res.json({
      status: 200,
      message: 'Message propagated to the swarm.'
    })
  }
  else {
    res.json({
      status: 404,
      message: 'Error: accountName missing.'
    })
  }
  res.end()
  return next()
})

server.listen(PORT, () => {
  console.log(`${server.name} is listening at ${server.url}`)
})