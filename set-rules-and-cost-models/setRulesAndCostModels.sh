#!/bin/bash
while read p; do
  echo "$p"
  graph indexer rules set ${p} minSignal 500000 minStake 1000 decisionBasis rules
  graph indexer cost set model ${p} costmodel.agora
done <subgraphsList.txt
graph indexer rules set global minSignal 500000 minStake 1000 decisionBasis rules
echo "Done!"