import { keepPreviousData, useQuery } from '@tanstack/react-query'
import AlAccumulationService from '@/_workspace/services/al-accumulation/AlAccumulationService'
import { AlAccumulationInterface } from '@/_workspace/types/al-accumulation/AlAccumulationInterface'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'AL_ACCUMULATION'

const useAlAccumulation = (isFetchData: boolean = true) =>
  useQuery<AxiosResponseI<AlAccumulationInterface[]>, Error>({
    queryKey: [PREFIX_QUERY_KEY],
    queryFn: () => AlAccumulationService.getAlAccumulationAll(),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export { useAlAccumulation }
