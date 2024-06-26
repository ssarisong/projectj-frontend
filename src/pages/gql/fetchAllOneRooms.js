import { gql } from '@apollo/client';

export const FETCH_ALL_ONE_ROOMS = gql`
  query FetchAllOneRooms {
    fetchOneRooms {
      id
      jibun
      monthly_rent
      area_exclusiveUse
      name
      dong
      is_monthly_rent
      deposit
      view
    }
  }
`;