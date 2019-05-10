# Kubernetes Deployment

WORK IN PROGRESS

## Requirements

kubectl > 1.14

Rabbit & Mongo installation

```sh
kubectl apply -f ext/
```

## Opfab deployment 

Deploy Opfab using [kustomize](https://github.com/kubernetes-sigs/kustomize)

```sh
kubectl apply -k deploy/
```
