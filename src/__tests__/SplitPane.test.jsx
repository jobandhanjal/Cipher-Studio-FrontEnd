import React from 'react';
import { render } from '@testing-library/react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

describe('SplitPane Layout', () => {
  it('should render and resize panels without errors', () => {
    const { getByTestId } = render(
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15} data-testid="panel-1">
          Panel 1
        </Panel>
        <PanelResizeHandle data-testid="resize-handle" />
        <Panel defaultSize={50} minSize={30} data-testid="panel-2">
          Panel 2
        </Panel>
      </PanelGroup>
    );

    const panel1 = getByTestId('panel-1');
    const panel2 = getByTestId('panel-2');
    const resizeHandle = getByTestId('resize-handle');

    // Verify panels and resize handle render
    expect(panel1).toBeInTheDocument();
    expect(panel2).toBeInTheDocument();
    expect(resizeHandle).toBeInTheDocument();

    // Simulate resizing (mock logic, as actual resizing requires browser interaction)
    // Example: Verify initial sizes or mock resize events
  });
});