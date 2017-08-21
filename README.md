# Touareg

*Touareg* is a web GUI for HashiCorp Nomad, made using vue.js.

To use it, simply rename index.html.example to index.html and adjust the variables to match your setup :
 - *window.nomad_url*: should point to the API endpoint of any Nomad node in the cluster
 - *window.nomad_node_url*: should point to the API endpoint of a specific node: the tag *{node}* in the URL will be replaced by the hostname. It is used for the live log streaming feature.
 - *window.consul_url*: should point to the API endpoint of a Consul cluster. It is not required but is used to provide a "reload" feature for allocations/task groups/jobs that Nomad does not provide yet.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

## The "reload" feature

That feature allows to restart an allocation, task group or whole job from Touareg, whithout having to make changes to the job specification. It makes use of a special templated file configured for each task, that fetches some keys from Consul. By changing their value, we can trigger a restart.

The configuration to use in the tasks is as follows :
```
template {
    destination = "local/reload_token"
    data = <<EOT
           {{ keyOrDefault (print "nomad_reload/allocation/" (env "NOMAD_ALLOC_NAME")) "" }}
           {{ keyOrDefault (print "nomad_reload/job/" (env "NOMAD_JOB_NAME")) "" }}
           {{ keyOrDefault (print "nomad_reload/job/" (env "NOMAD_JOB_NAME") "/" (env "NOMAD_TASK_NAME")) "" }}
           {{ keyOrDefault (print "nomad_reload/job/" (env "NOMAD_JOB_NAME") "/" (env "NOMAD_TASK_NAME") "/" (env "NOMAD_ALLOC_INDEX")) "" }}
    EOT
}
```
