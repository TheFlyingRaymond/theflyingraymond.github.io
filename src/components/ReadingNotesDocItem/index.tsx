import React from 'react';
import DocItem from '@theme/DocItem';
import type { Props } from '@theme/DocItem';

export default function ReadingNotesDocItem(props: Props): JSX.Element {
  return (
    <div className="reading-notes-content">
      <DocItem {...props} />
    </div>
  );
}
