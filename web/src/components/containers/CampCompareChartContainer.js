import React from 'react'
import styled from 'styled-components'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import _ from 'lodash'
import { DCREGION } from 'constants/dcregion'
import StackedNormalizedHorizontalBarChart from 'components/charts/StackedNormalizedHorizontalBarChart'

const Container = styled.div`
  && {
    width: 100%;
    display: flex;
    flex-direction: row;
  }
`

const FETCH_CAMP_DATA = gql`
  query fetch_camp_data($year: Int!) {
    dcd_candidates(where: { is_won: { _eq: true }, year: { _eq: $year } }) {
      cacode
      camp
      person {
        name_zh
      }
    }
  }
`

function groupDataByRegionAndCamp(candidates) {
  const byCodes = _.groupBy(candidates, candidate => candidate.cacode[0])
  return Object.keys(byCodes).map(code => ({
    code,
    count: byCodes[code]
      .map(r => ({ [r.camp]: 1 }))
      .reduce((p, c) => {
        const val = Object.assign(p)
        Object.keys(c).forEach(k => (val[k] = c[k] + (val[k] ? val[k] : 0)))
        return val
      }, {}),
  }))
}

function convertToD3Compatible(data) {
  var res = data.map(d => {
    return {
      name: DCREGION[d.code].zh_hk,
      建制: d.count['建制'] || 0,
      泛民: d.count['泛民'] || 0,
      其他: d.count['其他'] || 0,
      total: Object.values(d.count).reduce((acc, c) => {
        acc += c
        return acc
      }, 0),
    }
  })
  res['columns'] = ['name', '建制', '其他', '泛民']
  return res
}

const CampCompareChartContainer = props => {
  return (
    <Query query={FETCH_CAMP_DATA} variables={{ year: 2015 }}>
      {({ loading, error, data }) => {
        if (loading) return null
        if (error) return `Error! ${error}`

        const dataFroGraph = groupDataByRegionAndCamp(data.dcd_candidates)
        const dataForD3 = convertToD3Compatible(dataFroGraph)
        return (
          <Container>
            <StackedNormalizedHorizontalBarChart
              data={dataForD3}
            ></StackedNormalizedHorizontalBarChart>
          </Container>
        )
      }}
    </Query>
  )
}
export default CampCompareChartContainer