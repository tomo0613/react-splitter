const htmlSplitter = React.createClass({
    displayName: 'htmlSplitter',
    propTypes: {
        id: React.PropTypes.string.isRequired,
        orient: React.PropTypes.string,
        collapse: React.PropTypes.string,
        lineSize: React.PropTypes.number
    },
    getDefaultProps: function() {
        return {
            orient: 'vertical',
            lineSize: 5
        };
    },
    getInitialState: function() {
        const vertical = this.props.orient === 'vertical';
        return {
            initialStyle: {
                width: vertical ? (this.props.lineSize + 'px') : '100%',
                height: vertical ? '100%' : (this.props.lineSize + 'px'),
                cursor: vertical ? 'ew-resize' : 'ns-resize'
            }
        };
    },
    render: function() {
        return React.DOM.div({
            id: this.props.id,
            className: 'htmlSplitter',
            style: this.state.initialStyle
        }, null);
    },
    componentDidMount: function() {
        const props = this.props;
        const thisNode = ReactDOM.findDOMNode(this);
        const parentNode = thisNode.parentNode;
        const siblingNodeBefore = thisNode.previousSibling;
        const siblingNodeAfter = thisNode.nextSibling;
        const boundaries = parentNode.getBoundingClientRect();
        const borderPos = props.orient === 'vertical' ? boundaries.left : boundaries.top;
        const maxSize = props.orient === 'vertical' ? boundaries.width : boundaries.height;
        const limitProp = props.orient === 'vertical' ? 'min-width' : 'min-height';
        const sizeProp = 'flex-basis';
        let primaryNode = null;
        let secondaryNode = null;

        siblingNodeBefore.computedStyle = getComputedStyle(siblingNodeBefore);
        siblingNodeBefore.min = parseInt(siblingNodeBefore.computedStyle[limitProp]) || 0;
        siblingNodeBefore.hide = display(siblingNodeBefore, 'none');
        siblingNodeBefore.show = display(siblingNodeBefore, 'flex');
        siblingNodeAfter.computedStyle = getComputedStyle(siblingNodeAfter);
        siblingNodeAfter.min = parseInt(siblingNodeAfter.computedStyle[limitProp]) || 0;
        siblingNodeAfter.hide = display(siblingNodeAfter, 'none');
        siblingNodeAfter.show = display(siblingNodeAfter, 'flex');

        if (props.collapse) {
            primaryNode = props.collapse === 'before' ? siblingNodeBefore : siblingNodeAfter;
            secondaryNode = props.collapse === 'before' ? siblingNodeAfter : siblingNodeBefore;
        }

        thisNode.addEventListener('mousedown', setListeners);
        thisNode.addEventListener('dblclick', toggleCollapse);

        function setListeners() {
            parentNode.addEventListener('mouseup', removeListeners);
            parentNode.addEventListener('mouseleave', removeListeners);
            parentNode.addEventListener('mousemove', mouseMoveAction);
            setTextSelection('none');
        }
        function removeListeners() {
            parentNode.removeEventListener('mouseup', removeListeners);
            parentNode.removeEventListener('mouseleave', removeListeners);
            parentNode.removeEventListener('mousemove', mouseMoveAction);
            setTextSelection('auto');
        }
        function mouseMoveAction(e) {
            const space = {};
            const mousePos = props.orient === 'vertical' ? e.clientX : e.clientY;

            space.before = mousePos - borderPos;
            space.after = maxSize - (mousePos - borderPos);
            if (space.before > siblingNodeBefore.min && space.after > siblingNodeAfter.min) {
                expandNode();
                siblingNodeBefore.style[sizeProp] = space.before + 'px';
                siblingNodeAfter.style[sizeProp] = space.after + 'px';
            } else if (props.collapse && space[props.collapse] < primaryNode.min) {
                collapseNode();
            }
        }
        function collapseNode() {
            if (primaryNode.hide()) {
                secondaryNode.style[sizeProp] = maxSize + 'px';
            }
        }
        function expandNode() {
            if (primaryNode.show()) {
                secondaryNode.style[sizeProp] = (maxSize - parseInt(primaryNode.style[sizeProp]) || maxSize/2) + 'px';
            }
        }
        function toggleCollapse() {
            primaryNode.style.display !== 'none' ? collapseNode() : expandNode();
        }
        function display(node, propValue) {
            return () => {
               if (node.style.display === propValue) {
                   return false;
               }
               node.style.display = propValue;
               return true;
            };
        }
        function setTextSelection(value) {
            ['-ms-', '-moz-', ''].forEach((prefix) => parentNode.style[prefix + 'user-select'] = value);
        }
    }
});

var MainElement = React.createClass({
    displayName: 'MainElement',
    render: function() {
        return React.DOM.div({className: 'containerDiv'},
            React.DOM.div(
                {
                    className: 'verticalTestDivBefore'
                },
                'asd asd'
            ),
            React.createElement(htmlSplitter,
                {
                    // orient: 'vertical',
                    collapse: 'before'
                }
            ),
            React.DOM.div(
                {
                    className: 'verticalTestDivAfter'
                },
                null
            ),
            React.DOM.div(
                {
                    className: 'horizontalTestContainer'
                },
                React.DOM.div(
                    {
                        className: 'horizontalTestDivBefore'
                    },
                    'asd asdx'
                ),
                React.createElement(htmlSplitter,
                    {
                        orient: 'horizontal',
                        collapse: 'before'
                    }
                ),
                React.DOM.div(
                    {
                        className: 'horizontalTestDivAfter'
                    },
                    null
                )
            )
        );
    }
});

ReactDOM.render(React.createElement(MainElement), document.getElementById('rootElement'));
