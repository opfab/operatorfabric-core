# Demo

Deploy Demo if needed

```sh
kubectl.exe apply -f demo/
```

kubectl port-forward svc/cards-publication 2102:8080

cd demo
curl -X POST http://localhost:2102/cards -H "Content-type:application/json" --data @card.json

cd bundle
tar -czvf bundle-test.tar.gz config.json css/ template/ i18n/
kubectl port-forward svc/thirds 2100:8080

curl -X POST "http://localhost:2100/thirds/TSO1" -H  "accept: application/json" -H  "Content-Type: multipart/form-data" -F "file=@bundle-test.tar.gz;type=application/gzip"