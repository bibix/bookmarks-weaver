export type NodeId = string
export type VariableId = string
export type ColumnId = string

export interface TemplateComment {
  id: NodeId
  kind: 'comment'
  text: string
}

export interface TemplateFolder {
  id: NodeId
  kind: 'folder'
  name: string
  children: TemplateNode[]
}

export interface TemplateBookmark {
  id: NodeId
  kind: 'bookmark'
  title: string
  url: string
  description: string
  tags: string[]
  keywords: string[]
}

export type TemplateNode = TemplateComment | TemplateFolder | TemplateBookmark

export interface VariableColumn {
  id: ColumnId
  name: string
}

export interface Variable {
  id: VariableId
  name: string
  color: string
  columns: VariableColumn[]
  rows: string[][]
}

export interface AppState {
  outputFileName: string
  template: TemplateNode[]
  variables: Variable[]
}

export type TemplateField =
  | 'folder.name'
  | 'bookmark.title'
  | 'bookmark.url'
  | 'bookmark.description'
  | 'bookmark.tag'
  | 'bookmark.keyword'
  | 'filename'

export interface VarRef {
  variable: string
  column?: string
}

export type TemplateSegment =
  | { kind: 'text'; text: string }
  | {
      kind: 'ref'
      raw: string
      ref: VarRef
      valid: boolean
      known: boolean
      start: number
      end: number
    }
  | {
      kind: 'invalid'
      raw: string
      start: number
      end: number
      reason: string
    }

export interface ResolvedBookmark {
  title: string
  url: string
  description: string
  tags: string[]
  keywords: string[]
}

export interface ResolvedNode {
  kind: 'folder' | 'bookmark' | 'comment'
  id: string
}

export interface ResolvedFolder extends ResolvedNode {
  kind: 'folder'
  name: string
  children: AnyResolvedNode[]
}

export interface ResolvedBookmarkNode extends ResolvedNode {
  kind: 'bookmark'
  bookmark: ResolvedBookmark
}

export interface ResolvedComment extends ResolvedNode {
  kind: 'comment'
  text: string
}

export type AnyResolvedNode =
  | ResolvedFolder
  | ResolvedBookmarkNode
  | ResolvedComment
