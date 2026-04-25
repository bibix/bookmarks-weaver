import { describe, expect, it } from 'vitest'

import { collectGeneratedUrls, generatePreviewTree } from '../generator'
import type { TemplateNode, VariableTable } from '../../types'

const template: TemplateNode[] = [
  {
    id: 'folder-cluster',
    type: 'folder',
    nameTemplate: '{{ cluster }}',
    children: [
      {
        id: 'folder-index',
        type: 'folder',
        nameTemplate: '{{ index }}',
        children: [
          {
            id: 'bookmark-main',
            type: 'bookmark',
            titleTemplate: '{{ cluster }}-{{ index }}',
            urlTemplate: 'https://localhost/{{ cluster }}/{{ index }}',
            descriptionTemplate: 'desc',
            tagsTemplate: ['tag-{{ cluster }}'],
            keywordsTemplate: ['k-{{ index }}'],
          },
        ],
      },
    ],
  },
]

const variables: VariableTable[] = [
  {
    id: 'v1',
    name: 'cluster',
    color: '#93c5fd',
    columns: [{ id: 'c1', name: 'cluster', values: ['aaa', 'bbb'] }],
  },
  {
    id: 'v2',
    name: 'index',
    color: '#86efac',
    columns: [{ id: 'c2', name: 'index', values: ['1', '2'] }],
  },
]

describe('generatePreviewTree', () => {
  it('expands nested loops by variable rows for folders and bookmarks', () => {
    const result = generatePreviewTree(template, variables)

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ type: 'folder', name: 'aaa' })
    expect(result[1]).toMatchObject({ type: 'folder', name: 'bbb' })

    const firstCluster = result[0]
    if (firstCluster.type !== 'folder') {
      throw new Error('Expected folder')
    }

    expect(firstCluster.children).toHaveLength(2)
    expect(firstCluster.children[0]).toMatchObject({ type: 'folder', name: '1' })
    expect(firstCluster.children[1]).toMatchObject({ type: 'folder', name: '2' })
  })

  it('collects generated bookmark URLs', () => {
    const tree = generatePreviewTree(template, variables)
    const urls = collectGeneratedUrls(tree)

    expect(urls).toContain('https://localhost/aaa/1')
    expect(urls).toContain('https://localhost/aaa/2')
    expect(urls).toContain('https://localhost/bbb/1')
    expect(urls).toContain('https://localhost/bbb/2')
  })
})
