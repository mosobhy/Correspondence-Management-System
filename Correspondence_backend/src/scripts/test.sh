
echo "--------- Test Script up ----------"

export ENV=test;

npm run build;

npm run jasmine;

# delete the elasticsearch index
curl -X DELETE "localhost:9200/test_correspondences?pretty";

echo "\n---------- test done -----------"
