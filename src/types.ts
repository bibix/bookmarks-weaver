export type VariableId = string

export interface ListVariable {
  id: VariableId
  name: string
  kind: 'list'
  color: string
  values: string[]
}

export interface TableColumn {
  id: string
  name: string
  color: string
  values: string[]
}

export interface TableVariable {
  id: VariableId
  name: string
  kind: 'table'
  columns: TableColumn[]
}

export type Variable = ListVariable | TableVariable

export interface AppState {
  urlTemplate: string
  nameTemplate: string
  folderTemplate: string
  keywordsTemplate: string
  variables: Variable[]
  beginner: boolean
}

export interface ParsedUrl {
  scheme: string
  domain: string
  port: string
  path: string
  query: { key: string; value: string }[]
  fragment: string
  raw: string
}

export interface GeneratedBookmark {
  url: string
  name: string
  folder: string
  keywords: string
}

export type FragmentKind =
  | 'scheme'
  | 'domain'
  | 'port'
  | 'path'
  | 'qkey'
  | 'qvalue'
  | 'fragment'
  | 'variable'
  | 'literal'

export interface UrlToken {
  kind: FragmentKind
  text: string
  variableName?: string
}
