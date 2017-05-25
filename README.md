# micro-swarm-bash-runner-core


## Before we start:

This project is a proof of concept, do not use in production, it have 0 optimization, 0 code refactoring.


If you go into `/code/snode.js` you can add credentials so the nodes can connect later.


### Install stuff

```
npm install

```


### Run for development

```
npm run serve
```

This allows the code to be restarted on change (is using nodemon).



### Deploy 


```
npm run build
```

This will generate the `/build` directory, thats the production code.


### Test production

```
npm run production
```

This will run the code of the `/build` folder (thats the code generated after traspiling).



The es6 code should be placed on the `code` folder!