# Kubernetes Deployment

WORK IN PROGRESS

## Requirements

kubectl > 1.14

Rabbit & Mongo installation

```sh
kubectl apply -f ext/
```

## Helm & Ingress controler deployement


```sh
kubectl -n kube-system create serviceaccount tiller

kubectl create clusterrolebinding tiller \
  --clusterrole=cluster-admin \
  --serviceaccount=kube-system:tiller

helm init --service-account tiller

helm install stable/nginx-ingress --name nginx-ingress --set controller.hostNetwork=true --namespace kube-system
```

## Opfab deployment 

Deploy Opfab using [kustomize](https://github.com/kubernetes-sigs/kustomize)

```sh
kubectl apply -k deploy/
```

For specific env, use specific folder

```sh
kubectl apply -k env/dev/
```

## Misc

Add role to node :

kubectl label node <node> kubernetes.io/role=app