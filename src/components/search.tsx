import {List, ListItemProps} from '@raycast/api'
import {
  ComponentType,
  Dispatch,
  Key,
  ReactElement,
  SetStateAction,
  useState
} from 'react'
import {QueryKey, useQuery} from 'react-query'
import {useDebouncedValue} from '../hooks/use-debounced-value'
import withQueryClient from './with-query-client'

interface Props<T> {
  queryKey: (query: string) => QueryKey
  queryFn: (query: string) => Promise<T[]>
  itemProps: (item: T) => (ListItemProps & {key: Key}) | null
  actions: ComponentType<{item: T; query: string}>
  noQuery?: ComponentType<{setQuery: Dispatch<SetStateAction<string>>}>
}

export default function Search<T>(props: Props<T>) {
  return <SearchWrapper {...props} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SearchWrapper = withQueryClient<Props<any>>(function Search(
  props
): ReactElement {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {data, isFetching} = useQuery<any[]>(
    props.queryKey(debouncedQuery),
    () => props.queryFn(debouncedQuery),
    {
      keepPreviousData: true,
      enabled: debouncedQuery.trim() !== ''
    }
  )

  if (props.noQuery && query.trim() === '') {
    return <props.noQuery setQuery={setQuery} />
  }

  return (
    <List isLoading={isFetching} onSearchTextChange={setQuery}>
      {data?.map(item => {
        const itemProps = props.itemProps(item)

        return itemProps ? (
          <List.Item
            {...itemProps}
            actions={<props.actions item={item} query={query} />}
          />
        ) : null
      })}
    </List>
  )
})
