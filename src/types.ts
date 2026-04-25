export type TemplateNode = FolderNode | BookmarkNode | CommentNode

export interface FolderNode {
  id: string
  type: 'folder'
  nameTemplate: string
  children: TemplateNode[]
}

export interface BookmarkNode {
  id: string
  type: 'bookmark'
  titleTemplate: string
  urlTemplate: string
  descriptionTemplate: string
  tagsTemplate: string[]
  keywordsTemplate: string[]
}

export interface CommentNode {
  id: string
  type: 'comment'
  text: string
}

export interface VariableColumn {
  id: string
  name: string
  values: string[]
}

export interface VariableTable {
  id: string
  name: string
  color: string
  columns: VariableColumn[]
}

export interface GeneratedFolder {
  id: string
  type: 'folder'
  name: string
  children: GeneratedNode[]
}

export interface GeneratedBookmark {
  id: string
  type: 'bookmark'
  title: string
  url: string
  description: string
  tags: string[]
  keywords: string[]
}

export interface GeneratedComment {
  id: string
  type: 'comment'
  text: string
}

export type GeneratedNode = GeneratedFolder | GeneratedBookmark | GeneratedComment
