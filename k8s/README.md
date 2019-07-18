# Kubernetes Deployment

WORK IN PROGRESS

## Requirements

### Helm & Ingress controler deployement


```sh
kubectl -n kube-system create serviceaccount tiller

kubectl create clusterrolebinding tiller \
  --clusterrole=cluster-admin \
  --serviceaccount=kube-system:tiller

helm init --service-account tiller

helm install stable/nginx-ingress --name nginx-ingress --set controller.hostNetwork=true --namespace kube-system
```

### kubectl

kubectl > 1.14

### HA Rabbit MQ

helm install --name rabbitmq-ha --set rabbitmqPassword=guest --set prometheus.operator.enabled=false stable/rabbitmq-ha

see https://github.com/helm/charts/tree/master/stable/rabbitmq-ha for default options and configuration available

### Mongodb

A mongodb instance is required.

A helm chart is available if needed, for example
```sh
helm install --name mongodb stable/mongodb --set persistence.size=1Gi --set mongodbRootPassword=password
```

See [official documentation](https://github.com/helm/charts/tree/master/stable/mongodb) for configuration options


## Opfab deployment 

Deploy Opfab using [kustomize](https://github.com/kubernetes-sigs/kustomize) in version 2.0.3, integrated in kubectl.


```sh
kubectl apply -k k8s/deploy/
```

For specific env, use specific folder

```sh
kubectl apply -k k8s/env/dev/
```

For HA deployment, use `ha` folder.
All services will be deployed with 2 replicats and Eureka with HA configuration

```sh
kubectl apply -k k8s/env/ha/
```

## Misc

Add role to node :

kubectl label node <node> kubernetes.io/role=app