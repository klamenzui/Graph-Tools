#!/usr/bin/env ts-node

import gql from 'graphql-tag'
import axios from 'axios'
import {
	createNetworkSubgraphClient,
	SubgraphDeploymentID,
} from '@graphprotocol/common-ts'

async function main() {
	const client = await createNetworkSubgraphClient({
		url: 'https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-testnet-phase2',
	})

	const result = await client
		.query(
			gql`
				{
					subgraphs {
						displayName
						currentVersion {
							subgraphDeployment {
								id
							}
						}
						pastVersions {
							subgraphDeployment {
								id
							}
						}
					}
				}
			`
		)
		.toPromise()

	if (result.error) {
		throw result.error
	}

	if (!result.data || result.data.length === 0) {
		throw new Error('No data')
	}

	const subgraphs = result.data.subgraphs
	for (const subgraph of subgraphs) {
		const ids = [
			new SubgraphDeploymentID(subgraph.currentVersion.subgraphDeployment.id),
			...subgraph.pastVersions.map(
				(pastVersion) =>
					new SubgraphDeploymentID(pastVersion.subgraphDeployment.id)
			),
		]
		for (let id of ids) {
			const url = new URL(
				`/ipfs/api/v0/cat?arg=${id.ipfsHash}`,
				`https://testnet.thegraph.com/`
			).toString()
			const response = await axios.get(url)
			if (response.data.match('network: mainnet')) {
				console.log(`${subgraph.displayName};${id.ipfsHash};${subgraph.currentVersion.subgraphDeployment.id}`);
			}
		}
	}
}

main().catch(console.log)
