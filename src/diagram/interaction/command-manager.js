var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Connector, getBezierPoints, isEmptyVector } from '../objects/connector';
import { Node, BpmnSubEvent, BpmnAnnotation, Native } from '../objects/node';
import { PathElement } from '../core/elements/path-element';
import { TextElement } from '../core/elements/text-element';
import { OrthogonalSegment } from '../objects/connector';
import { Rect } from '../primitives/rect';
import { Diagram } from '../../diagram/diagram';
import { identityMatrix, rotateMatrix, transformPointByMatrix, scaleMatrix } from './../primitives/matrix';
import { cloneObject as clone, cloneObject, getBounds, getFunction, getIndex } from './../utility/base-util';
import { completeRegion, sort, findObjectIndex, intersect3, getAnnotationPosition, findParentInSwimlane } from './../utility/diagram-util';
import { updatePathElement, cloneBlazorObject, getUserHandlePosition, cloneSelectedObjects } from './../utility/diagram-util';
import { updateDefaultValues } from './../utility/diagram-util';
import { randomId, cornersPointsBeforeRotation } from './../utility/base-util';
import { Selector } from '../objects/node';
import { hasSelection, isSelected, hasSingleConnection, contains } from './actions';
import { DiagramEvent, ConnectorConstraints, BezierSmoothness } from '../enum/enum';
import { BlazorAction } from '../enum/enum';
import { canSelect, canMove, canRotate, canDragSourceEnd, canDragTargetEnd, canSingleSelect, canDrag } from './../utility/constraints-util';
import { canMultiSelect, canContinuousDraw } from './../utility/constraints-util';
import { canPanX, canPanY, canPageEditable } from './../utility/constraints-util';
import { SnapConstraints, DiagramTools, DiagramAction, RealAction } from '../enum/enum';
import { getDiagramElement, getAdornerLayerSvg, getHTMLLayer, getAdornerLayer, getSelectorElement } from '../utility/dom-util';
import { Point } from '../primitives/point';
import { Size } from '../primitives/size';
import { getObjectType, getPoint, intersect2, getOffsetOfConnector, canShowCorner } from './../utility/diagram-util';
import { selectionHasConnector } from './../utility/diagram-util';
import { Layer } from '../diagram/layer';
import { SelectorConstraints, DiagramConstraints } from '../enum/enum';
import { remove, isBlazor, isNullOrUndefined } from '@syncfusion/ej2-base';
import { getOppositeDirection, getPortDirection, findAngle } from './../utility/connector';
import { swapBounds, findPoint, orthoConnection2Segment, getIntersection } from './../utility/connector';
import { ShapeAnnotation, PathAnnotation } from '../objects/annotation';
import { renderContainerHelper } from './container-interaction';
import { checkChildNodeInContainer, checkParentAsContainer, addChildToContainer } from './container-interaction';
import { renderStackHighlighter } from './container-interaction';
import { getConnectors, updateConnectorsProperties, canLaneInterchange, findLane } from './../utility/swim-lane-util';
import { swimLaneSelection, pasteSwimLane, gridSelection } from '../utility/swim-lane-util';
import { DeepDiffMapper } from '../utility/diff-map';
/**
 * Defines the behavior of commands
 */
var CommandHandler = /** @class */ (function () {
    function CommandHandler(diagram) {
        /**   @private  */
        this.clipboardData = {};
        // private newNodeObject: Object[] = [];
        // private newConnectorObject: Object[] = [];
        /**   @private  */
        this.diagramObject = {};
        /**   @private  */
        this.newSelectedObjects = {};
        /**   @private  */
        this.oldSelectedObjects = {};
        /**   @private  */
        this.connectorsTable = [];
        /** @private */
        this.PreventConnectorSplit = false;
        /**   @private  */
        this.processTable = {};
        /**   @private  */
        this.deepDiffer = new DeepDiffMapper();
        /** @private */
        this.isContainer = false;
        /** @private */
        this.canUpdateTemplate = false;
        this.childTable = {};
        this.parentTable = {};
        this.blazor = 'Blazor';
        this.blazorInterop = 'sfBlazor';
        this.cloneGroupChildCollection = [];
        this.diagram = diagram;
    }
    Object.defineProperty(CommandHandler.prototype, "snappingModule", {
        /**   @private  */
        get: function () {
            return this.diagram.snappingModule;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommandHandler.prototype, "layoutAnimateModule", {
        /**   @private  */
        get: function () {
            return this.diagram.layoutAnimateModule;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * startTransaction method\
     *
     * @returns {  void }    startTransaction method .\
     * @param {boolean} protectChange - provide the options value.
     * @private
     */
    CommandHandler.prototype.startTransaction = function (protectChange) {
        this.state = { element: this.diagram.selectedItems, backup: null };
        if (protectChange) {
            this.diagram.protectPropertyChange(true);
        }
        getAdornerLayer(this.diagram.element.id).style.pointerEvents = 'none';
    };
    /**
     * endTransaction method\
     *
     * @returns {  void }    endTransaction method .\
     * @param {boolean} protectChange - provide the options value.
     * @private
     */
    CommandHandler.prototype.endTransaction = function (protectChange) {
        this.state = null;
        if (protectChange) {
            this.diagram.protectPropertyChange(false);
        }
        getAdornerLayer(this.diagram.element.id).style.pointerEvents = 'all';
    };
    /**
     * setFocus method\
     *
     * @returns {  void }    setFocus method .\
     * @private
     */
    CommandHandler.prototype.setFocus = function () {
        document.getElementById(this.diagram.element.id).focus();
    };
    /**
     * showTooltip method\
     *
     * @returns {  void }    showTooltip method .\
     * @param {IElement} node - provide the options value.
     * @param {PointModel} position - provide the position value.
     * @param {string | HTMLElement} content - provide the content value.
     * @param {string} toolName - provide the toolName value.
     * @param {boolean} isTooltipVisible - provide the isTooltipVisible value.
     * @private
     */
    CommandHandler.prototype.showTooltip = function (node, position, content, toolName, isTooltipVisible) {
        var _this = this;
        var targetId;
        var targetEle;
        var isNative = false;
        if (node instanceof Selector) {
            if ((node.nodes.length == 1) && node.connectors.length == 0) {
                targetId = node.nodes[0].id;
                if (node.nodes[0].shape && node.nodes[0].shape instanceof Native) {
                    isNative = true;
                }
            }
            else if ((node.nodes.length == 0) && node.connectors.length == 1) {
                targetId = node.connectors[0].id;
            }
            else {
                targetEle = document.getElementById(this.diagram.element.id + '_SelectorElement');
            }
        }
        else if (node instanceof Node) {
            targetId = node.id;
            if (node.shape && (node.shape instanceof Native)) {
                isNative = true;
            }
        }
        else {
            targetId = node.id;
        }
        if (isNullOrUndefined(targetEle) && !isNullOrUndefined(targetId)) {
            var idName = isNative ? '_content_native_element' : '_groupElement';
            targetEle = document.getElementById(targetId + idName);
        }
        if (isTooltipVisible) {
            this.diagram.tooltipObject.position = 'BottomCenter';
            this.diagram.tooltipObject.animation = { open: { delay: 0, duration: 0 } };
            this.diagram.tooltipObject.openDelay = 0;
            this.diagram.tooltipObject.closeDelay = 0;
        }
        if (this.diagram.selectedItems.setTooltipTemplate) {
            var template = void 0;
            var setTooltipTemplate = getFunction(this.diagram.selectedItems.setTooltipTemplate);
            if (setTooltipTemplate) {
                template = setTooltipTemplate(node, this.diagram);
            }
            if (template instanceof HTMLElement) {
                content = template.cloneNode(true);
            }
            else {
                content = template ? template : content;
            }
        }
        if (isBlazor() && isTooltipVisible) {
            this.diagram.tooltipObject.close();
        }
        if (node.tooltip) {
            this.diagram.tooltipObject.openOn = node.tooltip.openOn;
        }
        this.diagram.tooltipObject.content = content;
        this.diagram.tooltipObject.offsetX = 0;
        this.diagram.tooltipObject.offsetY = 0;
        if (isBlazor()) {
            this.diagram.tooltipObject.updateTooltip(targetEle);
        }
        else {
            this.diagram.tooltipObject.refresh(targetEle);
        }
        if (isTooltipVisible) {
            setTimeout(function () {
                _this.diagram.tooltipObject.open(targetEle);
            }, 1);
        }
    };
    /**
     * Split the connector, when the node is dropped onto it and establish connection with that dropped node.
     *
     * @returns {  void }   connectorSplit  method .\
     * @param {NodeModel}  droppedObject - Provide the dropped node id
     * @param {ConnectorModel} targetConnector - Provide the connector id
     * @private
     */
    CommandHandler.prototype.connectorSplit = function (droppedObject, targetConnector) {
        var droppedNodeId = droppedObject.id;
        var existingConnector = cloneObject(targetConnector);
        var connectorIndex;
        connectorIndex = this.diagram.connectors.indexOf(targetConnector);
        var nodeIndex;
        nodeIndex = this.diagram.nodes.indexOf(droppedObject);
        var droppedNode = cloneObject(droppedObject);
        var connectorOldChanges = {};
        var nodeOldChanges = {};
        var nodeOldProperty = {
            offsetX: droppedNode.offsetX,
            offsetY: droppedNode.offsetY
        };
        var connectorOldProperty = {
            sourceID: existingConnector.sourceID,
            sourcePoint: existingConnector.sourcePoint,
            sourcePortID: existingConnector.sourcePortID,
            targetID: existingConnector.targetID,
            targetPoint: existingConnector.targetPoint,
            targetPortID: existingConnector.targetPortID
        };
        connectorOldChanges[connectorIndex] = connectorOldProperty;
        nodeOldChanges[nodeIndex] = nodeOldProperty;
        var connectorNewChanges = {};
        var nodeNewChanges = {};
        var nodeNewProperty = {};
        var connectorNewProperty = {};
        //Split the connector based on the dropped node      
        if (existingConnector.sourceID != "" && existingConnector.targetID != "") {
            connectorNewProperty.targetID = this.ConnectorTargetChange(targetConnector, droppedNodeId);
        }
        else if (existingConnector.sourceID != "" && existingConnector.targetID == "") {
            this.nodeOffsetChange(nodeNewProperty, droppedNode, targetConnector.targetPoint);
            connectorNewProperty.targetID = this.ConnectorTargetChange(targetConnector, droppedNodeId);
        }
        else if ((existingConnector.sourceID == "" && existingConnector.targetID == "") || (existingConnector.sourceID == "" && existingConnector.targetID != "")) {
            this.nodeOffsetChange(nodeNewProperty, droppedNode, targetConnector.sourcePoint);
            connectorNewProperty.sourceID = this.ConnectorSourceChange(targetConnector, droppedNodeId);
        }
        connectorNewChanges[connectorIndex] = connectorNewProperty;
        nodeNewChanges[nodeIndex] = nodeNewProperty;
        this.diagram.nodePropertyChange(droppedObject, nodeOldProperty, nodeNewProperty);
        this.diagram.updateSelector();
        this.diagram.connectorPropertyChange(targetConnector, connectorOldProperty, connectorNewProperty);
        //Check Whether the connector connects with the node 
        if (existingConnector.sourceID != "" && existingConnector.targetID != "") {
            var newConnector = {
                id: "connector " + droppedNodeId,
                constraints: ConnectorConstraints.Default | ConnectorConstraints.AllowDrop,
                sourceID: droppedNodeId,
            };
            //Check whether the connector connects with the ports
            if (existingConnector.sourcePortID != "" && existingConnector.targetPortID != "") {
                newConnector.targetID = existingConnector.targetID;
                newConnector.targetPortID = existingConnector.targetPortID;
            }
            else {
                newConnector.targetID = existingConnector.targetID;
            }
            this.diagram.add(newConnector);
        }
        var entry = {
            type: 'PropertyChanged', redoObject: { nodes: nodeNewChanges }, undoObject: { nodes: nodeOldChanges },
            category: 'Internal'
        };
        this.diagram.addHistoryEntry(entry);
        var entry1 = {
            type: 'PropertyChanged', redoObject: { connectors: connectorNewChanges }, undoObject: { connectors: connectorOldChanges },
            category: 'Internal'
        };
        this.diagram.addHistoryEntry(entry1);
    };
    CommandHandler.prototype.nodeOffsetChange = function (propertyChangeArg, node, nodeNewOffset) {
        propertyChangeArg.offsetX = node.offsetX = nodeNewOffset.x;
        propertyChangeArg.offsetY = node.offsetY = nodeNewOffset.y;
    };
    CommandHandler.prototype.ConnectorTargetChange = function (connector, newTarget) {
        connector.targetID = newTarget;
        return newTarget;
    };
    CommandHandler.prototype.ConnectorSourceChange = function (connector, newTarget) {
        connector.sourceID = newTarget;
        return newTarget;
    };
    /**
     * closeTooltip method\
     *
     * @returns {  void }    closeTooltip method .\
     * @private
     */
    CommandHandler.prototype.closeTooltip = function () {
        this.diagram.tooltipObject.close();
    };
    /**
     * canEnableDefaultTooltip method\
     *
     * @returns {  boolean }    canEnableDefaultTooltip method .\
     * @private
     */
    CommandHandler.prototype.canEnableDefaultTooltip = function () {
        if (this.diagram.selectedItems.constraints & SelectorConstraints.ToolTip) {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * updateSelector method\
     *
     * @returns {  void }    updateSelector method .\
     * @private
     */
    CommandHandler.prototype.updateSelector = function () {
        this.diagram.updateSelector();
    };
    /**
     * updateConnectorValue method\
     *
     * @returns {  void }    updateConnectorValue method .\
     * @param {IBlazorConnectionChangeEventArgs} args - provide the options value.
     * @private
     */
    CommandHandler.prototype.updateConnectorValue = function (args) {
        if (args.cancel) {
            this.enableCloneObject(true);
            this.ismouseEvents(true);
            this.insertBlazorObject(args.connector);
            var newChanges = {};
            var oldChanges = {};
            var connector = this.diagram.nameTable[args.connector.id];
            var nodeEndId = args.connectorEnd === 'ConnectorSourceEnd' ? 'sourceID' : 'targetID';
            var portEndId = args.connectorEnd === 'ConnectorSourceEnd' ? 'sourcePortID' : 'targetPortID';
            var connectionEnd = args.connectorEnd === 'ConnectorTargetEnd';
            var newValue = connectionEnd ? args.newValue.connectorTargetValue : args.newValue.connectorSourceValue;
            var oldValue = connectionEnd ? args.oldValue.connectorTargetValue : args.oldValue.connectorSourceValue;
            oldChanges[nodeEndId] = newValue.nodeId;
            oldChanges[portEndId] = newValue.portId;
            newChanges[nodeEndId] = oldValue.nodeId;
            newChanges[portEndId] = oldValue.portId;
            if (args.cancel && args.connectorEnd !== 'ConnectorTargetEnd') {
                connector.sourceID = oldValue.nodeId;
                if (args.connector.sourcePortID) {
                    connector.sourcePortID = oldValue.portId;
                }
                this.diagram.connectorPropertyChange(connector, oldChanges, newChanges);
            }
            if (args.cancel && args.connectorEnd === 'ConnectorTargetEnd') {
                if (args.connector.targetPortID) {
                    connector.targetPortID = oldValue.portId;
                }
                connector.targetID = oldValue.nodeId;
                this.diagram.connectorPropertyChange(connector, oldChanges, newChanges);
            }
        }
    };
    /**
     * triggerEvent method\
     *
     * @returns {  Promise<void | object | IBlazorConnectionChangeEventArgs> }    triggerEvent method .\
     * @param {DiagramEvent} event - provide the options value.
     * @param {Object} args - provide the args value.
     * @private
     */
    CommandHandler.prototype.triggerEvent = function (event, args) {
        return __awaiter(this, void 0, void 0, function () {
            var temparg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (event === DiagramEvent.drop || event === DiagramEvent.positionChange ||
                            event === DiagramEvent.connectionChange) {
                            if (this.diagram.currentSymbol) {
                                return [2 /*return*/];
                            }
                            if (event === DiagramEvent.drop) {
                                args.source = cloneBlazorObject(this.diagram);
                            }
                            if (this.diagram.currentDrawingObject && event !== DiagramEvent.positionChange) {
                                return [2 /*return*/];
                            }
                        }
                        return [4 /*yield*/, this.diagram.triggerEvent(event, args)];
                    case 1:
                        temparg = _a.sent();
                        return [2 /*return*/, temparg];
                }
            });
        });
    };
    /**
     * dragOverElement method\
     *
     * @returns { void }    dragOverElement method .\
     * @param {MouseEventArgs} args - provide the options value.
     * @param {PointModel} currentPosition - provide the args value.
     * @private
     */
    CommandHandler.prototype.dragOverElement = function (args, currentPosition) {
        if (this.diagram.currentSymbol) {
            var dragOverArg = {
                element: cloneBlazorObject(args.source), target: cloneBlazorObject(args.target),
                mousePosition: cloneBlazorObject(currentPosition), diagram: cloneBlazorObject(this.diagram)
            };
            this.triggerEvent(DiagramEvent.dragOver, dragOverArg);
        }
    };
    /**
     * disConnect method\
     *
     * @returns { IConnectionChangeEventArgs | IBlazorConnectionChangeEventArgs }    disConnect method .\
     * @param {IElement} obj - provide the obj value.
     * @param {string} endPoint - provide the endPoint value.
     * @param {boolean} canCancel - provide the canCancel value.
     * @private
     */
    CommandHandler.prototype.disConnect = function (obj, endPoint, canCancel) {
        var checkBlazor = isBlazor();
        var oldChanges = {};
        var newChanges = {};
        var returnargs;
        var selectorModel;
        var connector;
        if (obj instanceof Selector) {
            selectorModel = obj;
            connector = selectorModel.connectors[0];
        }
        else if (obj instanceof Connector && this.diagram.currentDrawingObject) {
            connector = this.diagram.currentDrawingObject;
        }
        if (obj && connector && (hasSingleConnection(this.diagram) || this.diagram.currentDrawingObject)) {
            if (isBlazor()) {
                this.diagram.insertValue(cloneObject(connector), false);
            }
            if (endPoint && (endPoint === 'ConnectorSourceEnd' || endPoint === 'ConnectorTargetEnd')) {
                var nodeEndId = endPoint === 'ConnectorSourceEnd' ? 'sourceID' : 'targetID';
                var portEndId = endPoint === 'ConnectorSourceEnd' ? 'sourcePortID' : 'targetPortID';
                if (connector[nodeEndId]) { //connector.sourceID || connector.targetID
                    oldChanges[nodeEndId] = connector[nodeEndId];
                    connector[nodeEndId] = '';
                    newChanges[nodeEndId] = connector[nodeEndId];
                    if (connector.sourcePortID || connector.targetPortID) {
                        oldChanges[portEndId] = connector[portEndId];
                        connector[portEndId] = '';
                        newChanges[portEndId] = connector[portEndId];
                    }
                    returnargs = this.connectionEventChange(connector, oldChanges, newChanges, endPoint, canCancel);
                }
            }
            else if ((endPoint !== 'OrthoThumb' && endPoint !== 'SegmentEnd') && (connector.sourceID || connector.targetID)) {
                oldChanges = {
                    sourceID: connector.sourceID, sourcePortID: connector.sourcePortID,
                    targetID: connector.targetID, targetPortID: connector.targetPortID
                };
                connector.sourceID = '';
                connector.sourcePortID = '';
                connector.targetID = '';
                connector.targetPortID = '';
                newChanges = {
                    sourceID: connector.sourceID, sourcePortID: connector.sourcePortID,
                    targetID: connector.targetID, targetPortID: connector.targetPortID
                };
                var arg = {
                    connector: cloneBlazorObject(connector), oldValue: oldChanges,
                    newValue: newChanges, cancel: false, state: 'Changing', connectorEnd: endPoint
                };
                if (isBlazor()) {
                    arg = {
                        connector: cloneBlazorObject(connector),
                        oldValue: { connector: cloneBlazorObject(oldChanges) },
                        newValue: { connector: cloneBlazorObject(newChanges) },
                        cancel: false, state: 'Changed', connectorEnd: endPoint
                    };
                    returnargs = arg;
                }
                if (!checkBlazor) {
                    this.triggerEvent(DiagramEvent.connectionChange, arg);
                }
                if (arg.cancel) {
                    connector.sourceID = oldChanges.sourceID;
                    connector.sourcePortID = oldChanges.sourcePortID;
                    connector.targetID = oldChanges.targetID;
                    connector.targetPortID = oldChanges.targetPortID;
                }
                else {
                    this.diagram.connectorPropertyChange(connector, oldChanges, newChanges);
                    this.diagram.updateDiagramObject(connector);
                    arg = {
                        connector: connector, oldValue: oldChanges,
                        newValue: newChanges, cancel: false, state: 'Changed', connectorEnd: endPoint
                    };
                    if (isBlazor()) {
                        arg = {
                            connector: cloneBlazorObject(connector), oldValue: { connector: oldChanges },
                            newValue: { connector: newChanges }, cancel: false, state: 'Changed', connectorEnd: endPoint
                        };
                        returnargs = arg;
                    }
                    if (!checkBlazor) {
                        this.triggerEvent(DiagramEvent.connectionChange, arg);
                    }
                }
            }
        }
        return returnargs;
    };
    CommandHandler.prototype.connectionEventChange = function (connector, oldChanges, newChanges, endPoint, canCancel) {
        var checkBlazor = isBlazor();
        var nodeEndId = endPoint === 'ConnectorSourceEnd' ? 'sourceID' : 'targetID';
        var portEndId = endPoint === 'ConnectorSourceEnd' ? 'sourcePortID' : 'targetPortID';
        var connectedNode;
        if (this.enableCloneObject) {
            connectedNode = this.diagram.nameTable[newChanges[nodeEndId]];
            var nodeObject = cloneObject(connectedNode);
            this.diagram.insertValue(nodeObject, true);
        }
        var returnargs;
        var arg = {
            cancel: false, state: 'Changing', connectorEnd: endPoint,
            connector: cloneBlazorObject(connector), oldValue: { nodeId: oldChanges[nodeEndId], portId: oldChanges[portEndId] },
            newValue: { nodeId: newChanges[nodeEndId], portId: newChanges[portEndId] }
        };
        if (isBlazor()) {
            arg = {
                connector: cloneBlazorObject(connector),
                cancel: false, state: 'Changing', connectorEnd: endPoint,
                oldValue: undefined, newValue: undefined
            };
            if (endPoint === 'ConnectorSourceEnd') {
                arg.oldValue = {
                    connectorSourceValue: {
                        portId: oldChanges[portEndId], nodeId: oldChanges[nodeEndId]
                    }
                };
                arg.newValue = {
                    connectorSourceValue: { nodeId: newChanges[nodeEndId], portId: newChanges[portEndId] }
                };
            }
            else {
                arg.oldValue = {
                    connectorTargetValue: { nodeId: oldChanges[nodeEndId], portId: oldChanges[portEndId] }
                };
                arg.newValue = {
                    connectorTargetValue: { nodeId: newChanges[nodeEndId], portId: newChanges[portEndId] }
                };
            }
            returnargs = arg;
        }
        if (!checkBlazor) {
            this.triggerEvent(DiagramEvent.connectionChange, arg);
        }
        if (arg.cancel || (isBlazor() && canCancel)) {
            connector[nodeEndId] = oldChanges[nodeEndId];
            connector[portEndId] = oldChanges[portEndId];
            newChanges = oldChanges;
        }
        else {
            this.diagram.connectorPropertyChange(connector, oldChanges, newChanges);
            this.diagram.updateDiagramObject(connector);
            arg = {
                connector: cloneBlazorObject(connector), oldValue: { nodeId: oldChanges[nodeEndId], portId: oldChanges[portEndId] },
                newValue: {
                    nodeId: newChanges[nodeEndId],
                    portId: newChanges[portEndId]
                },
                cancel: false, state: 'Changing', connectorEnd: endPoint
            };
            if (isBlazor()) {
                arg = {
                    connector: cloneBlazorObject(connector),
                    oldValue: undefined,
                    newValue: undefined,
                    cancel: false, state: 'Changing', connectorEnd: endPoint
                };
                if (endPoint === 'ConnectorSourceEnd') {
                    arg.newValue = {
                        connectorSourceValue: { portId: newChanges[portEndId], nodeId: newChanges[nodeEndId] }
                    };
                    arg.oldValue = {
                        connectorSourceValue: { portId: oldChanges[portEndId], nodeId: oldChanges[nodeEndId] }
                    };
                }
                else {
                    arg.oldValue = {
                        connectorTargetValue: { nodeId: oldChanges[nodeEndId], portId: oldChanges[portEndId] }
                    };
                    arg.newValue = {
                        connectorTargetValue: { portId: newChanges[portEndId], nodeId: newChanges[nodeEndId] }
                    };
                }
                returnargs = arg;
            }
        }
        if (this.enableCloneObject) {
            if (connectedNode === undefined) {
                connectedNode = this.diagram.nameTable[oldChanges[nodeEndId]];
                var nodeObject = cloneObject(connectedNode);
                this.diagram.insertValue(nodeObject, true);
            }
        }
        return returnargs;
    };
    /**
     * insertBlazorObject method\
     *
     * @returns { void }    insertBlazorObject method .\
     * @param {IElement} object - provide the object value.
     * @param {boolean} isNode - provide the isNode value.
     * @private
     */
    CommandHandler.prototype.insertBlazorObject = function (object, isNode) {
        var node;
        var connector;
        if (object instanceof Selector) {
            this.oldSelectedObjects = cloneSelectedObjects(this.diagram);
            for (var i = 0; i < object.nodes.length; i++) {
                node = this.diagram.getObject(object.nodes[i].id);
                this.diagram.insertValue(cloneObject(node), true);
            }
            for (var i = 0; i < object.connectors.length; i++) {
                connector = this.diagram.getObject(object.connectors[i].id);
                this.diagram.insertValue(cloneObject(connector), false);
            }
        }
        else {
            object = this.diagram.getObject(object.id);
            this.diagram.insertValue(cloneObject(object), (object instanceof Node) ? true : false);
        }
    };
    /**
     * updatePropertiesToBlazor method\
     *
     * @returns { void }    updatePropertiesToBlazor method .\
     * @param {MouseEventArgs} args - provide the args value.
     * @param {PointModel} labelDrag - provide the labelDrag value.
     * @private
     */
    CommandHandler.prototype.updatePropertiesToBlazor = function (args, labelDrag) {
        this.enableCloneObject(false);
        this.ismouseEvents(false);
        this.getBlazorOldValues(args, labelDrag);
        this.updateBlazorSelector();
    };
    /**
     * insertSelectedObjects method\
     *
     * @returns { void }    insertSelectedObjects method .\
     * @private
     */
    CommandHandler.prototype.insertSelectedObjects = function () {
        this.oldSelectedObjects = cloneSelectedObjects(this.diagram);
    };
    /**
     * findTarget method\
     *
     * @returns { NodeModel | PointPortModel | ShapeAnnotationModel | PathAnnotationModel }    findTarget method .\
     * @param {DiagramElement} element - provide the element value.
     * @param {IElement} argsTarget - provide the argsTarget value.
     * @param {boolean} source - provide the source value.
     * @param {boolean} connection - provide the connection value.
     * @private
     */
    CommandHandler.prototype.findTarget = function (element, argsTarget, source, connection) {
        var target;
        if (argsTarget instanceof Node) {
            if (element && element.id === argsTarget.id + '_content') {
                return argsTarget;
            }
            if (source && argsTarget.shape.type === 'Bpmn' && ((!isBlazor() && argsTarget.shape.shape === 'Activity') ||
                (isBlazor() && argsTarget.shape.bpmnShape === 'Activity'))) {
                if (argsTarget.shape.activity.subProcess.type === 'Transaction') {
                    var transaction = argsTarget.shape.activity.subProcess.transaction;
                    if (transaction.success.visible && element.id.indexOf(argsTarget.id + '_success') === 0) {
                        return transaction.success;
                    }
                    if (transaction.cancel.visible && element.id.indexOf(argsTarget.id + '_cancel') === 0) {
                        return transaction.cancel;
                    }
                    if (transaction.failure.visible && element.id.indexOf(argsTarget.id + '_failure') === 0) {
                        return transaction.failure;
                    }
                }
            }
            if (element instanceof PathElement) {
                for (var i = 0; i < argsTarget.ports.length; i++) {
                    var port = argsTarget.ports[i];
                    if (element.id === argsTarget.id + '_' + port.id) {
                        return port;
                    }
                }
            }
        }
        if (!connection) {
            var annotation = void 0;
            for (var i = 0; i < argsTarget.annotations.length; i++) {
                annotation = argsTarget.annotations[i];
                if (element.id === argsTarget.id + '_' + annotation.id) {
                    return annotation;
                }
            }
        }
        return argsTarget;
    };
    /**
     * canDisconnect method\
     *
     * @returns { boolean }    canDisconnect method .\
     * @param {string} endPoint - provide the endPoint value.
     * @param {MouseEventArgs} args - provide the args value.
     * @param {string} targetPortId - provide the targetPortId value.
     * @param {string} targetNodeId - provide the targetNodeId value.
     * @private
     */
    CommandHandler.prototype.canDisconnect = function (endPoint, args, targetPortId, targetNodeId) {
        var selector;
        var connect;
        if (args.source instanceof Selector) {
            selector = args.source;
            connect = selector.connectors[0];
        }
        else if (args.source instanceof Connector && this.diagram.currentDrawingObject) {
            connect = this.diagram.currentDrawingObject;
        }
        var targetObject = this.findTarget(args.targetWrapper, args.target, endPoint === 'ConnectorSourceEnd', true);
        var nodeEnd = endPoint === 'ConnectorSourceEnd' ? 'sourceID' : 'targetID';
        var portEnd = endPoint === 'ConnectorSourceEnd' ? 'sourcePortID' : 'targetPortID';
        if (connect[nodeEnd] !== targetNodeId || connect[portEnd] !== targetPortId) {
            return true;
        }
        return false;
    };
    /**
     * changeAnnotationDrag method\
     *
     * @returns { void }    changeAnnotationDrag method .\
     * @param {MouseEventArgs} args - provide the endPoint value.
     * @private
     */
    CommandHandler.prototype.changeAnnotationDrag = function (args) {
        var selectorModel;
        var connector;
        if (args.source && args.source.connectors &&
            args.source.connectors.length && this.diagram.bpmnModule &&
            this.diagram.bpmnModule.textAnnotationConnectors.indexOf(args.source.connectors[0]) > -1) {
            if (args.source instanceof Selector) {
                selectorModel = args.source;
                connector = selectorModel.connectors[0];
            }
            var id = connector.id.split('_');
            var annotationId = id[id.length - 1];
            var nodeId = id[id.length - 3] || id[0];
            if (args.target && args.target.id !== nodeId &&
                ((!isBlazor() && args.target.shape.shape !== 'TextAnnotation') ||
                    (isBlazor() && args.target.shape.bpmnShape !== 'TextAnnotation'))) {
                this.diagram.startGroupAction();
                var parentNode = this.diagram.nameTable[id[0]];
                var clonedNode = this.getAnnotation(parentNode, id[1]);
                var annotationNode = {
                    id: id[1] + randomId(),
                    angle: Point.findAngle(connector.intermediatePoints[0], connector.intermediatePoints[1]),
                    text: clonedNode.text,
                    length: Point.distancePoints(connector.intermediatePoints[0], connector.intermediatePoints[1]),
                    shape: { shape: 'TextAnnotation', type: 'Bpmn' },
                    nodeId: clonedNode.nodeId
                };
                var annotationObj = new BpmnAnnotation(args.target.shape, 'annotations', annotationNode, true);
                this.diagram.bpmnModule.checkAndRemoveAnnotations(this.diagram.nameTable[connector.targetID], this.diagram);
                this.diagram.refreshCanvasLayers();
                annotationObj.id = id[1];
                this.diagram.addTextAnnotation(annotationObj, args.target);
                this.diagram.endGroupAction();
            }
            else if (connector) {
                connector.sourceID = nodeId;
                this.diagram.connectorPropertyChange(connector, {}, { sourceID: nodeId });
                this.diagram.updateDiagramObject(connector);
            }
        }
    };
    /* tslint:disable */
    /**
     * connect method\
     *
     * @returns { IConnectionChangeEventArgs | IBlazorConnectionChangeEventArgs }    connect method .\
     * @param {string} endPoint - provide the endPoint value.
     * @param {MouseEventArgs} args - provide the args value.
     * @param {boolean} canCancel - provide the canCancel value.
     * @private
     */
    CommandHandler.prototype.connect = function (endPoint, args, canCancel) {
        var checkBlazor;
        var newChanges = {};
        var oldChanges = {};
        var oldNodeId;
        var oldPortId;
        var selectorModel;
        var connector;
        var returnargs;
        if (args.source instanceof Selector) {
            selectorModel = args.source;
            connector = selectorModel.connectors[0];
        }
        else if (args.source instanceof Connector && this.diagram.currentDrawingObject) {
            connector = this.diagram.currentDrawingObject;
        }
        var target = this.findTarget((args.targetWrapper || args.sourceWrapper), (args.target || args.actualObject), endPoint === 'ConnectorSourceEnd', true);
        var nodeEndId = endPoint === 'ConnectorSourceEnd' ? 'sourceID' : 'targetID';
        var portEndId = endPoint === 'ConnectorSourceEnd' ? 'sourcePortID' : 'targetPortID';
        if (target instanceof Node) {
            oldChanges[nodeEndId] = connector[nodeEndId];
            connector[nodeEndId] = target.id;
            newChanges[nodeEndId] = connector[nodeEndId];
            oldChanges[portEndId] = connector[portEndId];
            returnargs = this.connectionEventChange(connector, oldChanges, newChanges, endPoint, canCancel);
        }
        else {
            oldNodeId = connector[nodeEndId];
            oldPortId = connector[portEndId];
            connector[portEndId] = target.id;
            connector[nodeEndId] = (args.target && args.target.id || args.actualObject.id);
            newChanges[nodeEndId] = connector[nodeEndId];
            newChanges[portEndId] = connector[portEndId];
            var arg = {
                connector: cloneBlazorObject(connector), oldValue: { nodeId: oldNodeId, portId: oldPortId },
                newValue: { nodeId: newChanges[nodeEndId], portId: newChanges[portEndId] },
                cancel: false, state: 'Changing', connectorEnd: endPoint
            };
            if (isBlazor()) {
                arg = {
                    connector: cloneBlazorObject(connector),
                    oldValue: undefined,
                    newValue: undefined,
                    cancel: false, state: 'Changing', connectorEnd: endPoint
                };
                if (endPoint === 'ConnectorSourceEnd') {
                    arg.oldValue = {
                        connectorSourceValue: { portId: oldChanges[portEndId], nodeId: oldChanges[nodeEndId] }
                    };
                    arg.newValue = {
                        connectorSourceValue: { portId: newChanges[portEndId], nodeId: newChanges[nodeEndId] }
                    };
                }
                else {
                    arg.newValue = {
                        connectorTargetValue: { portId: newChanges[portEndId], nodeId: newChanges[nodeEndId] }
                    };
                    arg.oldValue = {
                        connectorTargetValue: { portId: oldChanges[portEndId], nodeId: oldChanges[nodeEndId] }
                    };
                }
                returnargs = arg;
            }
            if (!checkBlazor) {
                this.triggerEvent(DiagramEvent.connectionChange, arg);
            }
            if (arg.cancel || (isBlazor() && canCancel)) {
                connector[nodeEndId] = oldNodeId;
                connector[portEndId] = oldPortId;
                newChanges[nodeEndId] = oldNodeId;
                newChanges[portEndId] = oldPortId;
            }
            else {
                this.diagram.connectorPropertyChange(connector, oldChanges, newChanges);
                this.diagram.updateDiagramObject(connector);
                arg = {
                    connector: cloneBlazorObject(connector), oldValue: { nodeId: oldNodeId, portId: oldPortId },
                    newValue: { nodeId: newChanges[nodeEndId], portId: newChanges[portEndId] }, cancel: false,
                    state: 'Changing', connectorEnd: endPoint
                };
                if (isBlazor()) {
                    arg = {
                        newValue: undefined,
                        connector: cloneBlazorObject(connector),
                        oldValue: undefined,
                        cancel: false, state: 'Changing', connectorEnd: endPoint
                    };
                    if (endPoint === 'ConnectorSourceEnd') {
                        arg.oldValue = {
                            connectorSourceValue: { portId: oldChanges[portEndId], nodeId: oldChanges[nodeEndId] }
                        };
                        arg.newValue = {
                            connectorTargetValue: { portId: newChanges[portEndId], nodeId: newChanges[nodeEndId] }
                        };
                    }
                    else {
                        arg.oldValue = {
                            connectorTargetValue: { portId: oldChanges[portEndId], nodeId: oldChanges[nodeEndId] }
                        };
                        arg.newValue = {
                            connectorTargetValue: { portId: newChanges[portEndId], nodeId: newChanges[nodeEndId] }
                        };
                    }
                }
            }
        }
        this.renderHighlighter(args, undefined, endPoint === 'ConnectorSourceEnd');
        return returnargs;
    };
    /* tslint:enable */
    /** @private */
    /**
     * cut method\
     *
     * @returns { void }    cut method .\
     * @private
     */
    CommandHandler.prototype.cut = function () {
        var index;
        this.clipboardData.pasteIndex = 0;
        if (this.diagram.undoRedoModule) {
            this.diagram.historyManager.startGroupAction();
        }
        this.clipboardData.clipObject = this.copyObjects();
        if (this.diagram.undoRedoModule) {
            this.diagram.historyManager.endGroupAction();
        }
        if (this.diagram.mode !== 'SVG') {
            this.diagram.refreshDiagramLayer();
        }
    };
    CommandHandler.prototype.UpdateBlazorDiagramModelLayers = function (layer, isRemove) {
        var blazorInterop = 'sfBlazor';
        var updatedModel = cloneBlazorObject(layer);
        var blazor = 'Blazor';
        if (window && window[blazor]) {
            var obj = {
                'methodName': 'UpdateBlazorDiagramModelLayers',
                'diagramobj': JSON.stringify(updatedModel), 'isRemove': isRemove
            };
            if (!this.diagram.isLoading) {
                window[blazorInterop].updateBlazorProperties(obj, this.diagram);
            }
        }
    };
    /**
     * addLayer method\
     *
     * @returns { void }    addLayer method .\
     * @param {LayerModel} layer - provide the endPoint value.
     * @param {Object[]} objects - provide the args value.
     * @param {boolean} isServerUpdate - provide the canCancel value.
     * @private
     */
    CommandHandler.prototype.addLayer = function (layer, objects, isServerUpdate) {
        if (isServerUpdate === void 0) { isServerUpdate = true; }
        layer.id = layer.id || randomId();
        layer.zIndex = this.diagram.layers.length;
        var isEnableServerDatabind = this.diagram.allowServerDataBinding;
        this.diagram.enableServerDataBinding(false);
        layer = new Layer(this.diagram, 'layers', layer, true);
        this.diagram.enableServerDataBinding(isEnableServerDatabind);
        layer.objectZIndex = -1;
        layer.zIndexTable = {};
        this.diagram.layers.push(layer);
        if (isServerUpdate) {
            this.UpdateBlazorDiagramModelLayers(layer, false);
        }
        this.diagram.layerZIndexTable[layer.zIndex] = layer.id;
        this.diagram.activeLayer = layer;
        var layers = layer.objects;
        if (objects) {
            for (var i = 0; i < objects.length; i++) {
                this.diagram.add(objects[i]);
            }
        }
    };
    /**
     * getObjectLayer method\
     *
     * @returns { LayerModel }    getObjectLayer method .\
     * @param {string} objectName - provide the endPoint value.
     * @private
     */
    CommandHandler.prototype.getObjectLayer = function (objectName) {
        var layers = this.diagram.layers;
        for (var i = 0; i < layers.length; i++) {
            var objIndex = layers[i].objects.indexOf(objectName);
            if (objIndex > -1) {
                return layers[i];
            }
        }
        return this.diagram.activeLayer;
    };
    /**
     * getLayer method\
     *
     * @returns { LayerModel }    getLayer method .\
     * @param {string} layerName - provide the endPoint value.
     * @private
     */
    CommandHandler.prototype.getLayer = function (layerName) {
        var layers = this.diagram.layers;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].id === layerName) {
                return layers[i];
            }
        }
        return undefined;
    };
    /**
     * removeLayer method\
     *
     * @returns { void }    removeLayer method .\
     * @param {string} layerId - provide the endPoint value.
     * @param {boolean} isServerUpdate - provide the endPoint value.
     * @private
     */
    CommandHandler.prototype.removeLayer = function (layerId, isServerUpdate) {
        if (isServerUpdate === void 0) { isServerUpdate = true; }
        var layers = this.getLayer(layerId);
        if (layers) {
            var index = this.diagram.layers.indexOf(layers);
            var layerObject = layers.objects;
            for (var i = layerObject.length - 1; i >= 0; i--) {
                this.diagram.unSelect(this.diagram.nameTable[layerObject[i]]);
                this.diagram.remove(this.diagram.nameTable[layerObject[i]]);
                if (layers.id !== 'default_layer') {
                    if (this.diagram.activeLayer.id === layerId) {
                        this.diagram.activeLayer = this.diagram.layers[this.diagram.layers.length - 1];
                    }
                }
            }
            if (isServerUpdate) {
                this.UpdateBlazorDiagramModelLayers(this.diagram.layers[index], true);
            }
            delete this.diagram.layerZIndexTable[layers.zIndex];
            this.diagram.layers.splice(index, 1);
            if (this.diagram.mode !== 'SVG') {
                this.diagram.refreshDiagramLayer();
            }
        }
    };
    /**
     * moveObjects method\
     *
     * @returns { void }    moveObjects method .\
     * @param {string[]]} objects - provide the objects value.
     * @param {string} targetLayer - provide the targetLayer value.
     * @private
     */
    CommandHandler.prototype.moveObjects = function (objects, targetLayer) {
        var layer = this.getLayer(targetLayer) || this.diagram.activeLayer;
        this.diagram.setActiveLayer(layer.id);
        var targerNodes;
        for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
            var i = objects_1[_i];
            var layer_1 = this.getObjectLayer(i);
            var index = layer_1.objects.indexOf(i);
            if (index > -1) {
                targerNodes = this.diagram.nameTable[i];
                this.diagram.unSelect(targerNodes);
                this.diagram.remove(this.diagram.nameTable[i]);
                this.diagram.add(targerNodes);
            }
        }
    };
    /**
     * cloneLayer method\
     *
     * @returns { void }    cloneLayer method .\
     * @param {string[]} layerName - provide the objects value.
     * @private
     */
    CommandHandler.prototype.cloneLayer = function (layerName) {
        var layers = this.diagram.layers;
        var layer = this.getLayer(layerName);
        if (layer) {
            var cloneObject_1 = [];
            var newlayer = {
                id: layerName + '_' + randomId(), objects: [], visible: true, lock: false
            };
            this.addLayer(newlayer, null, true);
            newlayer.zIndex = this.diagram.layers.length - 1;
            var multiSelect = cloneObject_1.length !== 1;
            for (var _i = 0, _a = layer.objects; _i < _a.length; _i++) {
                var obj = _a[_i];
                cloneObject_1.push(this.diagram.nameTable[obj]);
            }
            this.paste(cloneObject_1);
        }
    };
    /**
     * copy method\
     *
     * @returns { void }    copy method .\
     * @private
     */
    CommandHandler.prototype.copy = function () {
        this.clipboardData.pasteIndex = 1;
        this.clipboardData.clipObject = this.copyObjects();
        return this.clipboardData.clipObject;
    };
    /**
     * copyObjects method\
     *
     * @returns { Object[] }    copyObjects method .\
     * @private
     */
    CommandHandler.prototype.copyObjects = function () {
        var selectedItems = [];
        var obj = [];
        this.clipboardData.childTable = {};
        if (this.diagram.selectedItems.connectors.length > 0) {
            selectedItems = this.diagram.selectedItems.connectors;
            for (var j = 0; j < selectedItems.length; j++) {
                var element = void 0;
                if (this.diagram.bpmnModule &&
                    this.diagram.bpmnModule.textAnnotationConnectors.indexOf(selectedItems[j]) > -1) {
                    element = cloneObject((this.diagram.nameTable[selectedItems[j].targetID]));
                }
                else {
                    element = cloneObject((selectedItems[j]));
                }
                obj.push(element);
            }
        }
        if (this.diagram.selectedItems.nodes.length > 0) {
            selectedItems = selectedItems.concat(this.diagram.selectedItems.nodes);
            for (var j = 0; j < this.diagram.selectedItems.nodes.length; j++) {
                if (!selectedItems[j].isPhase) {
                    var node = clone(this.diagram.selectedItems.nodes[j]);
                    if (node.wrapper && (node.offsetX !== node.wrapper.offsetX)) {
                        node.offsetX = node.wrapper.offsetX;
                    }
                    if (node.wrapper && (node.offsetY !== node.wrapper.offsetY)) {
                        node.offsetY = node.wrapper.offsetY;
                    }
                    var processTable = {};
                    this.copyProcesses(node);
                    obj.push(clone(node));
                    var matrix = identityMatrix();
                    rotateMatrix(matrix, -node.rotateAngle, node.offsetX, node.offsetY);
                    if (node.children) {
                        var childTable = this.clipboardData.childTable;
                        var tempNode = void 0;
                        var elements = [];
                        var nodes = this.getAllDescendants(node, elements, true);
                        for (var i = 0; i < nodes.length; i++) {
                            tempNode = this.diagram.nameTable[nodes[i].id];
                            var clonedObject = childTable[tempNode.id] = clone(tempNode);
                            var newOffset = transformPointByMatrix(matrix, { x: clonedObject.wrapper.offsetX, y: clonedObject.wrapper.offsetY });
                            if (tempNode instanceof Node) {
                                clonedObject.offsetX = newOffset.x;
                                clonedObject.offsetY = newOffset.y;
                                clonedObject.rotateAngle -= node.rotateAngle;
                            }
                        }
                        this.clipboardData.childTable = childTable;
                    }
                    if (node.shape.type === 'SwimLane') {
                        var swimlane = this.diagram.getObject(this.diagram.selectedItems.nodes[j].id);
                        var childTable = this.clipboardData.childTable;
                        var connectorsList = getConnectors(this.diagram, swimlane.wrapper.children[0], 0, true);
                        for (var i = 0; i < connectorsList.length; i++) {
                            var connector = this.diagram.getObject(connectorsList[i]);
                            childTable[connector.id] = clone(connector);
                        }
                    }
                    if (node && node.isLane) {
                        var childTable = this.clipboardData.childTable;
                        var swimlane = this.diagram.getObject(node.parentId);
                        var lane = findLane(node, this.diagram);
                        childTable[node.id] = cloneObject(lane);
                        childTable[node.id].width = swimlane.wrapper.actualSize.width;
                    }
                }
            }
        }
        if (this.clipboardData.pasteIndex === 0) {
            this.startGroupAction();
            for (var _i = 0, selectedItems_1 = selectedItems; _i < selectedItems_1.length; _i++) {
                var item = selectedItems_1[_i];
                if (this.diagram.nameTable[item.id]) {
                    if (this.diagram.bpmnModule &&
                        this.diagram.bpmnModule.textAnnotationConnectors.indexOf(item) > -1) {
                        this.diagram.remove(this.diagram.nameTable[item.targetID]);
                    }
                    else {
                        this.diagram.remove(item);
                    }
                }
            }
            this.endGroupAction();
        }
        this.sortByZIndex(obj, 'zIndex');
        return obj;
    };
    CommandHandler.prototype.copyProcesses = function (node) {
        if (node.shape.type === 'Bpmn' && node.shape.activity &&
            node.shape.activity.subProcess.processes &&
            node.shape.activity.subProcess.processes.length > 0) {
            var processes = node.shape.activity.subProcess.processes;
            for (var _i = 0, processes_1 = processes; _i < processes_1.length; _i++) {
                var i = processes_1[_i];
                this.processTable[i] = (clone(this.diagram.nameTable[i]));
                if (this.processTable[i].shape.activity.subProcess.processes &&
                    this.processTable[i].shape.activity.subProcess.processes.length > 0) {
                    this.copyProcesses(this.processTable[i]);
                }
            }
            this.clipboardData.processTable = this.processTable;
        }
    };
    /**
     * group method\
     *
     * @returns { void }    group method .\
     * @private
     */
    CommandHandler.prototype.group = function () {
        this.oldSelectedObjects = cloneSelectedObjects(this.diagram);
        var propName = 'isProtectedOnChange';
        var protectedChange = this.diagram[propName];
        this.diagram.protectPropertyChange(true);
        this.diagram.diagramActions = this.diagram.diagramActions | DiagramAction.Group;
        var selectedItems = [];
        var obj = {};
        //let group: Node | Connector;
        obj.id = 'group' + randomId();
        obj = new Node(this.diagram, 'nodes', obj, true);
        obj.children = [];
        selectedItems = this.diagram.selectedItems.nodes;
        selectedItems = selectedItems.concat(this.diagram.selectedItems.connectors);
        var order = selectedItems.sort(function (a, b) {
            return a.zIndex - b.zIndex;
        });
        for (var i = 0; i < order.length; i++) {
            if (!order[i].parentId) {
                obj.children.push(order[i].id);
            }
        }
        var group = this.diagram.add(obj);
        if (group) {
            this.select(group);
        }
        var entry = { type: 'Group', undoObject: obj, redoObject: obj, category: 'Internal' };
        this.addHistoryEntry(entry);
        this.diagram.diagramActions = this.diagram.diagramActions & ~DiagramAction.Group;
        this.diagram.protectPropertyChange(protectedChange);
        this.updateBlazorSelector();
    };
    /**
     * unGroup method\
     *
     * @returns {  void }    unGroup method .\
     * @param {NodeModel} obj - provide the angle value.
     * @private
     */
    CommandHandler.prototype.unGroup = function (obj) {
        var propName = 'isProtectedOnChange';
        var protectedChange = this.diagram[propName];
        this.diagram.protectPropertyChange(true);
        this.diagram.diagramActions = this.diagram.diagramActions | DiagramAction.Group;
        var selectedItems = [];
        if (obj) {
            selectedItems.push(obj);
        }
        else {
            selectedItems = this.diagram.selectedItems.nodes;
        }
        this.diagram.startGroupAction();
        for (var i = 0; i < selectedItems.length; i++) {
            var node = selectedItems[i];
            var undoObject = cloneObject(node);
            var childCollection = [];
            for (var k = 0; k < node.children.length; k++) {
                childCollection.push(node.children[k]);
            }
            if (node.children) {
                if (node.ports && node.ports.length > 0) {
                    this.diagram.removePorts(node, node.ports);
                }
                if (node.annotations && node.annotations.length > 0
                    && (!isBlazor() || isBlazor() && node.annotations[0].content !== '')) {
                    this.diagram.removeLabels(node, node.annotations);
                }
                var parentNode = this.diagram.nameTable[node.parentId];
                for (var j = node.children.length - 1; j >= 0; j--) {
                    (this.diagram.nameTable[node.children[j]]).parentId = '';
                    this.diagram.deleteChild(this.diagram.nameTable[node.children[j]], node);
                    if (node.parentId && node.children[j]) {
                        this.diagram.addChild(parentNode, node.children[j]);
                    }
                }
                this.resetDependentConnectors(node.inEdges, true);
                this.resetDependentConnectors(node.outEdges, false);
                var entry = {
                    type: 'UnGroup', undoObject: undoObject,
                    redoObject: undoObject, category: 'Internal'
                };
                if (!(this.diagram.diagramActions & DiagramAction.UndoRedo)) {
                    this.addHistoryEntry(entry);
                }
                if (node.parentId) {
                    this.diagram.deleteChild(node, parentNode);
                }
            }
            this.diagram.removeNode(node, childCollection);
            this.clearSelection();
        }
        this.diagram.endGroupAction();
        this.diagram.diagramActions = this.diagram.diagramActions & ~DiagramAction.Group;
        this.diagram.protectPropertyChange(protectedChange);
    };
    CommandHandler.prototype.resetDependentConnectors = function (edges, isInEdges) {
        for (var i = 0; i < edges.length; i++) {
            var newConnector = this.diagram.nameTable[edges[i]];
            var undoObject = cloneObject(newConnector);
            var newProp = void 0;
            if (isInEdges) {
                newConnector.targetID = '';
                newConnector.targetPortID = '';
                newProp = { targetID: newConnector.targetID, targetPortID: newConnector.targetPortID };
            }
            else {
                newConnector.sourceID = '';
                newConnector.sourcePortID = '';
                newProp = { sourceID: newConnector.sourceID, sourcePortID: newConnector.sourcePortID };
            }
            this.diagram.connectorPropertyChange(newConnector, {}, newProp);
            var entry = {
                type: 'ConnectionChanged', undoObject: { connectors: [undoObject], nodes: [] },
                redoObject: { connectors: [cloneObject(newConnector)], nodes: [] }, category: 'Internal'
            };
            if (!(this.diagram.diagramActions & DiagramAction.UndoRedo)) {
                this.addHistoryEntry(entry);
            }
        }
    };
    /**
     * paste method\
     *
     * @returns { void }    paste method .\
     * @param {(NodeModel | ConnectorModel)[]} obj - provide the objects value.
     * @private
     */
    CommandHandler.prototype.paste = function (obj) {
        if (obj || this.clipboardData.clipObject) {
            this.diagram.protectPropertyChange(true);
            var copiedItems = obj ? this.getNewObject(obj) :
                this.clipboardData.clipObject;
            if (copiedItems) {
                var multiSelect = copiedItems.length !== 1;
                var groupAction = false;
                var objectTable = {};
                var keyTable = {};
                if (this.clipboardData.pasteIndex !== 0) {
                    this.clearSelection();
                }
                if (this.diagram.undoRedoModule) {
                    groupAction = true;
                    this.diagram.historyManager.startGroupAction();
                }
                for (var _i = 0, copiedItems_1 = copiedItems; _i < copiedItems_1.length; _i++) {
                    var copy = copiedItems_1[_i];
                    objectTable[copy.id] = copy;
                }
                var copiedObject = [];
                if (multiSelect) {
                    // This bool is also consider to prevent selection change event is triggered after every object clone
                    this.diagram.isServerUpdate = true;
                }
                for (var j = 0; j < copiedItems.length; j++) {
                    var copy = copiedItems[j];
                    if (getObjectType(copy) === Connector) {
                        var clonedObj = clone(copy);
                        var nodeId = clonedObj.sourceID;
                        clonedObj.sourceID = '';
                        if (objectTable[nodeId] && keyTable[nodeId]) {
                            clonedObj.sourceID = keyTable[nodeId];
                        }
                        nodeId = clonedObj.targetID;
                        clonedObj.targetID = '';
                        if (objectTable[nodeId] && keyTable[nodeId]) {
                            clonedObj.targetID = keyTable[nodeId];
                        }
                        var newObj = this.cloneConnector(clonedObj, multiSelect);
                        copiedObject.push(newObj);
                        keyTable[copy.id] = newObj.id;
                    }
                    else {
                        var newNode = this.cloneNode(copy, multiSelect);
                        if (isBlazor() && newNode && newNode.children && newNode.children.length > 0) {
                            copiedObject = copiedObject.concat(this.cloneGroupChildCollection);
                            this.cloneGroupChildCollection = [];
                        }
                        else {
                            copiedObject.push(newNode);
                        }
                        //bpmn text annotations will not be pasted
                        if (newNode) {
                            keyTable[copy.id] = newNode.id;
                            var edges = copy.inEdges;
                            if (edges) {
                                for (var _a = 0, edges_1 = edges; _a < edges_1.length; _a++) {
                                    var edge = edges_1[_a];
                                    if (objectTable[edge] && keyTable[edge]) {
                                        var newConnector = this.diagram.nameTable[keyTable[edge]];
                                        newConnector.targetID = keyTable[copy.id];
                                        this.diagram.connectorPropertyChange(newConnector, { targetID: '', targetPortID: '' }, { targetID: newConnector.targetID, targetPortID: newConnector.targetPortID });
                                    }
                                }
                            }
                            edges = copy.outEdges;
                            if (edges) {
                                for (var _b = 0, edges_2 = edges; _b < edges_2.length; _b++) {
                                    var edge = edges_2[_b];
                                    if (objectTable[edge] && keyTable[edge]) {
                                        var newConnector = this.diagram.nameTable[keyTable[edge]];
                                        newConnector.sourceID = keyTable[copy.id];
                                        this.diagram.connectorPropertyChange(newConnector, { sourceID: '', sourcePortID: '' }, { sourceID: newConnector.sourceID, sourcePortID: newConnector.sourcePortID });
                                    }
                                }
                            }
                        }
                    }
                }
                if (multiSelect) {
                    this.diagram.isServerUpdate = false;
                    this.diagram.UpdateBlazorDiagramModelCollection(copiedItems[0], copiedObject);
                    this.getBlazorOldValues();
                    this.diagram.select(copiedObject, true);
                }
                if (groupAction === true) {
                    this.diagram.historyManager.endGroupAction();
                    groupAction = false;
                }
                if (this.diagram.mode !== 'SVG') {
                    this.diagram.refreshDiagramLayer();
                }
                this.clipboardData.pasteIndex++;
                this.diagram.protectPropertyChange(false);
            }
        }
    };
    CommandHandler.prototype.getNewObject = function (obj) {
        var newObj;
        var newobjs = [];
        this.clipboardData.pasteIndex = 1;
        for (var i = 0; i < obj.length; i++) {
            newObj = cloneObject(obj[i]);
            newobjs.push(newObj);
        }
        return newobjs;
    };
    CommandHandler.prototype.cloneConnector = function (connector, multiSelect) {
        //let newConnector: Node | Connector;
        var cloneObject = clone(connector);
        this.translateObject(cloneObject);
        cloneObject.zIndex = -1;
        var newConnector = this.diagram.add(cloneObject);
        if (!this.diagram.isServerUpdate) {
            this.selectObjects([newConnector], multiSelect);
        }
        return newConnector;
    };
    CommandHandler.prototype.cloneNode = function (node, multiSelect, children, groupnodeID) {
        var newNode;
        var connectorsTable = {};
        var cloneObject = clone(node);
        var process;
        var temp = this.diagram.nameTable[node.parentId];
        if (node.shape && node.shape.type === 'Bpmn' && node.shape.activity &&
            node.shape.activity.subProcess.processes
            && node.shape.activity.subProcess.processes.length) {
            process = cloneObject.shape.activity.subProcess.processes;
            cloneObject.zIndex = -1;
            cloneObject.shape.activity.subProcess.processes = undefined;
        }
        if (node.shape && node.shape.type === 'SwimLane') {
            pasteSwimLane(node, this.diagram, this.clipboardData);
        }
        else if (temp && temp.shape.type === 'SwimLane') {
            pasteSwimLane(clone(temp), this.diagram, this.clipboardData, node, true);
        }
        else if (node.children && node.children.length && (!children || !children.length)) {
            newNode = this.cloneGroup(node, multiSelect);
        }
        else if (node.shape && ((!isBlazor() && node.shape.shape === 'TextAnnotation') ||
            (isBlazor() && node.shape.bpmnShape === 'TextAnnotation')) && node.id.indexOf('_textannotation_') !== -1 &&
            this.diagram.nameTable[node.id]) {
            var checkAnnotation = node.id.split('_textannotation_');
            //const parentNode: Node;
            var annotation = this.diagram.nameTable[node.id];
            for (var j = 0; j < annotation.inEdges.length; j++) {
                var connector = this.diagram.nameTable[annotation.inEdges[j]];
                if (connector) {
                    var parentNode = this.diagram.nameTable[connector.sourceID];
                    var clonedNode = this.getAnnotation(parentNode, checkAnnotation[1]);
                    var annotationNode = {
                        id: checkAnnotation[1] + randomId(),
                        angle: clonedNode.angle,
                        text: clonedNode.text,
                        length: clonedNode.length,
                        shape: { shape: 'TextAnnotation', type: 'Bpmn' },
                        nodeId: clonedNode.nodeId
                    };
                    this.diagram.addTextAnnotation(annotationNode, parentNode);
                }
            }
        }
        else {
            this.translateObject(cloneObject, groupnodeID);
            cloneObject.zIndex = -1;
            if (children) {
                cloneObject.children = children;
            }
            newNode = this.diagram.add(cloneObject);
        }
        for (var _i = 0, _a = Object.keys(connectorsTable); _i < _a.length; _i++) {
            var i = _a[_i];
            this.diagram.add(connectorsTable[i]);
        }
        if (process && process.length) {
            newNode.shape.activity.subProcess.processes = process;
            this.cloneSubProcesses(newNode);
        }
        if (newNode && !this.diagram.isServerUpdate) {
            this.selectObjects([newNode], multiSelect);
        }
        return newNode;
    };
    CommandHandler.prototype.getAnnotation = function (parent, annotationId) {
        var currentAnnotation = parent.shape.annotations;
        if (currentAnnotation && currentAnnotation.length) {
            for (var g = 0; g <= currentAnnotation.length; g++) {
                if (currentAnnotation[g].id === annotationId) {
                    return currentAnnotation[g];
                }
            }
        }
        return undefined;
    };
    CommandHandler.prototype.cloneSubProcesses = function (node) {
        var connector = [];
        var temp = {};
        if (node.shape.type === 'Bpmn' && node.shape.activity &&
            node.shape.activity.subProcess.processes
            && node.shape.activity.subProcess.processes.length) {
            var process = node.shape.activity.subProcess.processes;
            for (var g = 0; g < process.length; g++) {
                var child = this.diagram.nameTable[process[g]] || this.clipboardData.processTable[process[g]];
                for (var _i = 0, _a = child.outEdges; _i < _a.length; _i++) {
                    var j = _a[_i];
                    if (connector.indexOf(j) < 0) {
                        connector.push(j);
                    }
                }
                for (var _b = 0, _c = child.inEdges; _b < _c.length; _b++) {
                    var j = _c[_b];
                    if (connector.indexOf(j) < 0) {
                        connector.push(j);
                    }
                }
                var innerChild = cloneObject(this.clipboardData.processTable[process[g]]);
                innerChild.processId = node.id;
                var newNode = this.cloneNode(innerChild, false);
                temp[process[g]] = newNode.id;
                process[g] = newNode.id;
                this.diagram.addProcess(newNode, node.id);
                for (var _d = 0, connector_1 = connector; _d < connector_1.length; _d++) {
                    var i = connector_1[_d];
                    var node_1 = this.diagram.nameTable[i] || this.diagram.connectorTable[i];
                    var clonedNode = cloneObject(node_1);
                    if (temp[clonedNode.sourceID] && temp[clonedNode.targetID]) {
                        clonedNode.zIndex = -1;
                        clonedNode.id += randomId();
                        clonedNode.sourceID = temp[clonedNode.sourceID];
                        clonedNode.targetID = temp[clonedNode.targetID];
                        connector.splice(connector.indexOf(i), 1);
                        this.diagram.add(clonedNode);
                    }
                }
            }
        }
    };
    CommandHandler.prototype.cloneGroup = function (obj, multiSelect) {
        var value;
        var newChildren = [];
        var children = [];
        var connectorObj = [];
        var newObj;
        var oldID = [];
        children = children.concat(obj.children);
        var id = randomId();
        var objectCollection = [];
        this.diagram.blazorActions |= BlazorAction.GroupClipboardInProcess;
        if (this.clipboardData.childTable || obj.children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var childObj = void 0;
                if (this.clipboardData.childTable) {
                    childObj = this.clipboardData.childTable[children[i]];
                }
                else {
                    childObj = this.diagram.nameTable[children[i]];
                }
                childObj.parentId = '';
                if (childObj) {
                    if (getObjectType(childObj) === Connector) {
                        connectorObj.push(childObj);
                    }
                    else {
                        newObj = this.cloneNode(childObj, multiSelect, undefined, id);
                        oldID.push(childObj.id);
                        newChildren.push(newObj.id);
                        objectCollection.push(newObj);
                    }
                }
            }
        }
        for (var k = 0; k < connectorObj.length; k++) {
            if (connectorObj[k].sourceID || connectorObj[k].targetID) {
                for (var j = 0; j < oldID.length; j++) {
                    if (connectorObj[k].sourceID === (oldID[j])) {
                        connectorObj[k].sourceID += id;
                    }
                    if (connectorObj[k].targetID === (oldID[j])) {
                        connectorObj[k].targetID += id;
                    }
                }
            }
            newObj = this.cloneConnector(connectorObj[k], multiSelect);
            newChildren.push(newObj.id);
            objectCollection.push(newObj);
        }
        var parentObj = this.cloneNode(obj, multiSelect, newChildren);
        objectCollection.push(parentObj);
        if (parentObj && parentObj.container && parentObj.shape && parentObj.shape.type === 'UmlClassifier') {
            this.diagram.updateDiagramObject(parentObj);
            parentObj.wrapper.measure(new Size());
        }
        this.diagram.blazorActions &= ~BlazorAction.GroupClipboardInProcess;
        if (!this.diagram.isServerUpdate) {
            this.diagram.UpdateBlazorDiagramModelCollection(undefined, objectCollection, undefined, true);
        }
        else {
            this.cloneGroupChildCollection = objectCollection;
        }
        return parentObj;
    };
    /**
     * translateObject method\
     *
     * @returns { Object[] }    translateObject method .\
     * @param {Node | Connector} obj - provide the objects value.
     * @param {string} groupnodeID - provide the objects value.
     * @private
     */
    CommandHandler.prototype.translateObject = function (obj, groupnodeID) {
        obj.id += groupnodeID || randomId();
        var diff = this.clipboardData.pasteIndex * 10;
        if (getObjectType(obj) === Connector) {
            obj.sourcePoint = {
                x: obj.sourcePoint.x + diff, y: obj.sourcePoint.y + diff
            };
            obj.targetPoint = {
                x: obj.targetPoint.x + diff, y: obj.targetPoint.y + diff
            };
            if (obj.type === 'Bezier') {
                var segments = obj.segments;
                for (var i = 0; i < segments.length; i++) {
                    if (!Point.isEmptyPoint(segments[i].point1)) {
                        segments[i].point1 = {
                            x: segments[i].point1.x + diff, y: segments[i].point1.y + diff
                        };
                    }
                    if (!Point.isEmptyPoint(segments[i].point2)) {
                        segments[i].point2 = {
                            x: segments[i].point2.x + diff, y: segments[i].point2.y + diff
                        };
                    }
                }
            }
            if (obj.type === 'Straight' || obj.type === 'Bezier') {
                if (obj.segments && obj.segments.length > 0) {
                    var segments = obj.segments;
                    for (var i = 0; i < segments.length - 1; i++) {
                        segments[i].point.x += diff;
                        segments[i].point.y += diff;
                    }
                }
            }
        }
        else {
            obj.offsetX += diff;
            obj.offsetY += diff;
        }
    };
    /**
     * drawObject method\
     *
     * @returns { Node | Connector }    drawObject method .\
     * @param {Node | Connector} obj - provide the objects value.
     * @private
     */
    CommandHandler.prototype.drawObject = function (obj) {
        var oldProtectPropertyChangeValue;
        if (isBlazor()) {
            oldProtectPropertyChangeValue = this.diagram.getProtectPropertyChangeValue();
            this.diagram.protectPropertyChange(true);
        }
        var newObj;
        //let cloneObject: Node | Connector;
        if (obj && obj.shape) {
            if (obj.shape.type === 'Text') {
                obj.width = this.diagram.drawingObject.width ? this.diagram.drawingObject.width : 50;
                obj.height = this.diagram.drawingObject.height ? this.diagram.drawingObject.height : 20;
            }
        }
        var cloneObject = clone(this.diagram.drawingObject);
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var prop = _a[_i];
            cloneObject[prop] = obj[prop];
        }
        if (getObjectType(this.diagram.drawingObject) === Node) {
            newObj = new Node(this.diagram, 'nodes', cloneObject, true);
            newObj.id = (this.diagram.drawingObject.id || 'node') + randomId();
        }
        else {
            newObj = new Connector(this.diagram, 'connectors', cloneObject, true);
            if (isBlazor() && !this.diagram.drawingObject) {
                newObj.type === 'Orthogonal';
            }
            newObj.id = (this.diagram.drawingObject ? (this.diagram.drawingObject.id ? this.diagram.drawingObject.id : 'connector')
                : 'connector') + randomId();
        }
        if (isBlazor()) {
            updateDefaultValues(newObj, cloneObject, (getObjectType(this.diagram.drawingObject) === Node) ? this.diagram.nodeDefaults : this.diagram.connectorDefaults);
        }
        this.diagram.initObject(newObj);
        this.diagram.updateDiagramObject(newObj);
        this.diagram.currentDrawingObject = newObj;
        if (isBlazor()) {
            this.diagram.protectPropertyChange(oldProtectPropertyChangeValue);
        }
        return newObj;
    };
    /**
     * addObjectToDiagram method\
     *
     * @returns { void }    addObjectToDiagram method .\
     * @param {Node | Connector} obj - provide the objects value.
     * @private
     */
    CommandHandler.prototype.addObjectToDiagram = function (obj) {
        //let newObj: Node | Connector;
        this.diagram.removeFromAQuad(obj);
        this.diagram.removeObjectsFromLayer(this.diagram.nameTable[obj.id]);
        delete this.diagram.nameTable[obj.id];
        var newObj = this.diagram.add(obj);
        if (this.diagram.mode !== 'SVG') {
            this.diagram.refreshDiagramLayer();
        }
        this.selectObjects([newObj]);
        if (obj && (!(canContinuousDraw(this.diagram)))) {
            this.diagram.tool &= ~DiagramTools.DrawOnce;
            this.diagram.currentDrawingObject = undefined;
        }
    };
    /**
     * addObjectToDiagram method\
     *
     * @returns { void }    addObjectToDiagram method .\
     * @param {boolean} enable - provide the objects value.
     * @private
     */
    CommandHandler.prototype.enableServerDataBinding = function (enable) {
        this.diagram.enableServerDataBinding(enable);
    };
    /**
     * addText method\
     *
     * @returns { void }    addText method .\
     * @param {boolean} obj - provide the objects value.
     * @param {PointModel} currentPosition - provide the objects value.
     * @private
     */
    CommandHandler.prototype.addText = function (obj, currentPosition) {
        var annotation = this.diagram.findElementUnderMouse(obj, currentPosition);
        this.diagram.startTextEdit(obj, annotation instanceof TextElement ? (annotation.id).split('_')[1] : undefined);
    };
    CommandHandler.prototype.updateArgsObject = function (obj, arg1, argValue) {
        if (obj) {
            var connector = void 0;
            for (var i = 0; i < obj.length; i++) {
                connector = (getObjectType(obj[i]) === Connector);
                if (connector) {
                    // In Blazor web assembly, deserialize the object. Itb takes time. - Suganthi
                    //argValue.connectors.push(cloneBlazorObject(obj[i]));
                    argValue.connectorCollection.push(obj[i].id);
                }
                else {
                    //argValue.nodes.push(cloneBlazorObject(obj[i]));
                    argValue.nodeCollection.push(obj[i].id);
                }
                //connector ? argValue.connectors.push(cloneBlazorObject(obj[i])) : argValue.nodes.push(cloneBlazorObject(obj[i]));
            }
        }
    };
    CommandHandler.prototype.updateSelectionChangeEventArgs = function (arg, obj, oldValue) {
        if (isBlazor()) {
            arg = {
                cause: this.diagram.diagramActions, newValue: {}, oldValue: {},
                state: arg.state, type: arg.type, cancel: false
            };
            var argOldValue = arg.oldValue;
            var argNewValue = arg.newValue;
            argOldValue.connectors = [];
            argOldValue.nodes = [];
            argNewValue.connectors = [];
            argNewValue.nodes = [];
            argOldValue.nodeCollection = [];
            argOldValue.connectorCollection = [];
            argNewValue.nodeCollection = [];
            argNewValue.connectorCollection = [];
            this.updateArgsObject(this.getSelectedObject(), arg, argNewValue);
            this.updateArgsObject(oldValue, arg, argOldValue);
            return arg;
        }
        return arg;
    };
    /**
     * isUserHandle method\
     *
     * @returns { boolean }    isUserHandle method .\
     * @param {PointModel} position - provide the objects value.
     * @private
     */
    CommandHandler.prototype.isUserHandle = function (position) {
        var handle = this.diagram.selectedItems;
        if (handle.wrapper && canShowCorner(handle.constraints, 'UserHandle')) {
            for (var _i = 0, _a = handle.userHandles; _i < _a.length; _i++) {
                var obj = _a[_i];
                if (obj.visible) {
                    var paddedBounds = getUserHandlePosition(handle, obj, this.diagram.scroller.transform);
                    if (contains(position, paddedBounds, obj.size / (2 * this.diagram.scroller.transform.scale))) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    /**
     * selectObjects method\
     *
     * @returns { Promise<void> }    selectObjects method .\
     * @param {(NodeModel | ConnectorModel)[]} obj - provide the objects value.
     * @param {boolean} multipleSelection - provide the objects value.
     * @param {(NodeModel | ConnectorModel)[]} oldValue - provide the objects value.
     * @private
     */
    CommandHandler.prototype.selectObjects = function (obj, multipleSelection, oldValue) {
        return __awaiter(this, void 0, void 0, function () {
            var arg, swimlaneNode, laneId, j, i, parentId, select, oldSelectedItems, canDoMultipleSelection, canDoSingleSelection, i, newObj, i_1, parentNode, blazorArgs, eventObj, selectedObjects, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        arg = {
                            oldValue: oldValue ? oldValue : this.getSelectedObject(),
                            newValue: obj, cause: this.diagram.diagramActions,
                            state: 'Changing', type: 'Addition', cancel: false
                        };
                        // EJ2-57157 - Added to consider the lane header at selection change when selecting a lane.
                        if (obj.length > 0 && (obj[0] && obj[0].isLane)) {
                            swimlaneNode = this.diagram.getObject(obj[0].parentId);
                            obj[0].shape.header = [];
                            laneId = '';
                            for (j = 0; j < obj.length; j++) {
                                for (i = 0; i < swimlaneNode.shape.lanes.length; i++) {
                                    parentId = obj[0].id.split(obj[0].parentId);
                                    laneId = parentId[1].slice(0, -1);
                                    if (laneId === swimlaneNode.shape.lanes[i].id) {
                                        obj[0].shape.header.push(swimlaneNode.shape.lanes[i].header);
                                    }
                                }
                            }
                        }
                        this.diagram.enableServerDataBinding(false);
                        select = true;
                        if (!isBlazor()) {
                            this.diagram.triggerEvent(DiagramEvent.selectionChange, arg);
                        }
                        else {
                            this.oldSelectedObjects = cloneSelectedObjects(this.diagram);
                        }
                        oldSelectedItems = (this.diagram.selectedItems.nodes.concat(this.diagram.selectedItems.connectors));
                        canDoMultipleSelection = canMultiSelect(this.diagram);
                        canDoSingleSelection = canSingleSelect(this.diagram);
                        if (canDoSingleSelection || canDoMultipleSelection) {
                            if (!canDoMultipleSelection && ((obj.length > 1) || (multipleSelection && obj.length === 1))) {
                                if (obj.length === 1) {
                                    this.clearSelection();
                                }
                                else {
                                    return [2 /*return*/];
                                }
                            }
                            if (!(canDoSingleSelection || canDoMultipleSelection) && obj.length === 1
                                && (!multipleSelection || !hasSelection(this.diagram))) {
                                this.clearSelection();
                                return [2 /*return*/];
                            }
                        }
                        if (!!arg.cancel) return [3 /*break*/, 5];
                        for (i = 0; i < obj.length; i++) {
                            newObj = obj[i];
                            if (newObj) {
                                select = true;
                                if (!hasSelection(this.diagram)) {
                                    this.select(newObj, i > 0 || multipleSelection, true);
                                }
                                else {
                                    if ((i > 0 || multipleSelection) && newObj.children && !newObj.parentId) {
                                        for (i_1 = 0; i_1 < this.diagram.selectedItems.nodes.length; i_1++) {
                                            parentNode = this.diagram.nameTable[this.diagram.selectedItems.nodes[i_1].parentId];
                                            if (parentNode) {
                                                parentNode = this.findParent(parentNode);
                                                if (parentNode) {
                                                    if (newObj.id === parentNode.id) {
                                                        this.selectGroup(newObj);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    this.selectProcesses(newObj);
                                    select = this.selectBpmnSubProcesses(newObj);
                                    if (select) {
                                        this.select(newObj, i > 0 || multipleSelection, true);
                                    }
                                }
                            }
                        }
                        if (oldValue === undefined) {
                            oldValue = oldSelectedItems;
                        }
                        arg = {
                            oldValue: oldValue ? oldValue : [],
                            newValue: this.getSelectedObject(),
                            cause: this.diagram.diagramActions, state: 'Changed', type: 'Addition', cancel: false
                        };
                        this.diagram.renderSelector(multipleSelection || (obj && obj.length > 1));
                        this.updateBlazorSelectorModel(oldValue);
                        if (isBlazor() && this.diagram.selectionChange) {
                            arg = this.updateSelectionChangeEventArgs(arg, obj, oldValue ? oldValue : []);
                            this.updateBlazorSelector();
                        }
                        if (!!isBlazor()) return [3 /*break*/, 1];
                        this.diagram.triggerEvent(DiagramEvent.selectionChange, arg);
                        return [3 /*break*/, 4];
                    case 1:
                        blazorArgs = void 0;
                        if (!(window && window[this.blazor] && this.diagram.selectionChange)) return [3 /*break*/, 3];
                        eventObj = { 'EventName': 'selectionChange', args: JSON.stringify(arg) };
                        return [4 /*yield*/, window[this.blazorInterop].updateBlazorDiagramEvents(eventObj, this.diagram)];
                    case 2:
                        blazorArgs = _a.sent();
                        _a.label = 3;
                    case 3:
                        // let blazorArgs: void | object = await this.diagram.triggerEvent(DiagramEvent.selectionChange, arg);
                        if (blazorArgs && blazorArgs.cancel) {
                            selectedObjects = [];
                            if (blazorArgs.oldValue.nodes.length > 0) {
                                selectedObjects = blazorArgs.oldValue.nodes;
                            }
                            if (blazorArgs.oldValue.connectors.length > 0) {
                                selectedObjects = selectedObjects.concat(blazorArgs.oldValue.connectors);
                            }
                            if (selectedObjects) {
                                if (selectedObjects.length > 0) {
                                    for (i = 0; i < selectedObjects.length; i++) {
                                        this.select(this.diagram.nameTable[selectedObjects[i].id], (i !== 0 && selectedObjects.length > 1) ? true : false);
                                    }
                                }
                                else {
                                    this.clearSelection();
                                }
                            }
                        }
                        _a.label = 4;
                    case 4:
                        this.diagram.enableServerDataBinding(true);
                        this.updateBlazorSelector();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * updateBlazorSelector method\
     *
     * @returns { void }    updateBlazorSelector method .\
     * @private
     */
    CommandHandler.prototype.updateBlazorSelector = function () {
        if (isBlazor() && this.oldSelectedObjects) {
            this.newSelectedObjects = cloneSelectedObjects(this.diagram);
            var result = this.deepDiffer.map(cloneObject(this.newSelectedObjects), this.oldSelectedObjects);
            var diffValue = this.deepDiffer.frameObject({}, result);
            var diff = this.deepDiffer.removeEmptyValues(diffValue);
            diff.nodes = [];
            for (var i = 0; i < this.diagram.selectedItems.nodes.length; i++) {
                diff.nodes.push(this.diagram.selectedItems.nodes[i].id);
            }
            diff.connectors = [];
            for (var i = 0; i < this.diagram.selectedItems.connectors.length; i++) {
                diff.connectors.push(this.diagram.selectedItems.connectors[i].id);
            }
            var blazorInterop = 'sfBlazor';
            var blazor = 'Blazor';
            if (window && window[blazor]) {
                var obj = { 'methodName': 'UpdateBlazorProperties', 'diagramobj': { selectedItems: diff } };
                window[blazorInterop].updateBlazorProperties(obj, this.diagram);
            }
            this.oldSelectedObjects = undefined;
            this.newSelectedObjects = undefined;
        }
    };
    /**
     * findParent method\
     *
     * @returns { Node }    findParent method .\
     * @param {Node} node - provide the objects value.
     * @private
     */
    CommandHandler.prototype.findParent = function (node) {
        if (node.parentId) {
            node = this.diagram.nameTable[node.parentId];
            this.findParent(node);
        }
        return node;
    };
    CommandHandler.prototype.selectProcesses = function (newObj) {
        if (this.hasProcesses(newObj)) {
            var processes = (newObj).shape.activity.subProcess.processes;
            for (var i = 0; i < processes.length; i++) {
                var innerChild = this.diagram.nameTable[processes[i]];
                if (this.hasProcesses(innerChild)) {
                    this.selectObjects([innerChild], true);
                }
                this.unSelect(innerChild);
            }
        }
    };
    CommandHandler.prototype.selectGroup = function (newObj) {
        for (var j = 0; j < newObj.children.length; j++) {
            var innerChild = this.diagram.nameTable[newObj.children[j]];
            if (innerChild.children) {
                this.selectGroup(innerChild);
            }
            this.unSelect(this.diagram.nameTable[newObj.children[j]]);
        }
    };
    CommandHandler.prototype.selectBpmnSubProcesses = function (node) {
        var select = true;
        var parent;
        if (node.processId) {
            if (isSelected(this.diagram, this.diagram.nameTable[node.processId])) {
                select = false;
            }
            else {
                select = this.selectBpmnSubProcesses(this.diagram.nameTable[node.processId]);
            }
        }
        else if (node instanceof Connector) {
            if (node.sourceID && this.diagram.nameTable[node.sourceID] &&
                this.diagram.nameTable[node.sourceID].processId) {
                parent = this.diagram.nameTable[node.sourceID].processId;
            }
            if (node.targetID && this.diagram.nameTable[node.targetID] &&
                this.diagram.nameTable[node.targetID].processId) {
                parent = this.diagram.nameTable[node.targetID].processId;
            }
            if (parent) {
                if (isSelected(this.diagram, this.diagram.nameTable[parent])) {
                    return false;
                }
                else {
                    select = this.selectBpmnSubProcesses(this.diagram.nameTable[parent]);
                }
            }
        }
        else if (node.parentId && this.diagram.nameTable[node.parentId] &&
            this.diagram.nameTable[node.parentId].shape.type === 'UmlClassifier') {
            if (isSelected(this.diagram, this.diagram.nameTable[node.parentId])) {
                select = false;
            }
        }
        return select;
    };
    CommandHandler.prototype.hasProcesses = function (node) {
        if (node) {
            if ((node.shape.type === 'Bpmn') && node.shape.activity &&
                node.shape.activity.subProcess.processes &&
                node.shape.activity.subProcess.processes.length > 0) {
                return true;
            }
        }
        return false;
    };
    /**
     * select method\
     *
     * @returns { void }    select method .\
     * @param {NodeModel | ConnectorModel} obj - provide the objects value.
     * @param {boolean} multipleSelection - provide the objects value.
     * @param {boolean} preventUpdate - provide the objects value.
     * @private
     */
    CommandHandler.prototype.select = function (obj, multipleSelection, preventUpdate) {
        var hasLayer = this.getObjectLayer(obj.id);
        if ((canSelect(obj) && !(obj instanceof Selector) && !isSelected(this.diagram, obj))
            && (hasLayer && !hasLayer.lock && hasLayer.visible) && obj.wrapper.visible) {
            multipleSelection = hasSelection(this.diagram) ? multipleSelection : false;
            if (!multipleSelection) {
                this.clearSelection();
            }
            this.diagram.enableServerDataBinding(false);
            var selectorModel = this.diagram.selectedItems;
            var convert = obj;
            if (convert instanceof Node) {
                if (obj.isHeader) {
                    var node = this.diagram.nameTable[obj.parentId];
                    selectorModel.nodes.push(node);
                }
                else {
                    selectorModel.nodes.push(obj);
                }
            }
            else {
                selectorModel.connectors.push(obj);
            }
            // EJ2-56919 - Push the newly selected objects in selectedObjects collection
            selectorModel.selectedObjects.push(obj);
            if (!multipleSelection) {
                selectorModel.init(this.diagram);
                if (selectorModel.nodes.length === 1 && selectorModel.connectors.length === 0) {
                    var wrapper = gridSelection(this.diagram, selectorModel);
                    if (wrapper) {
                        selectorModel.wrapper.children[0] = wrapper;
                    }
                    selectorModel.rotateAngle = selectorModel.nodes[0].rotateAngle;
                    selectorModel.wrapper.rotateAngle = selectorModel.nodes[0].rotateAngle;
                    selectorModel.wrapper.pivot = selectorModel.nodes[0].pivot;
                }
            }
            else {
                selectorModel.wrapper.rotateAngle = selectorModel.rotateAngle = 0;
                selectorModel.wrapper.children.push(obj.wrapper);
            }
            if (!preventUpdate) {
                this.diagram.renderSelector(multipleSelection);
            }
            this.diagram.enableServerDataBinding(true);
        }
    };
    CommandHandler.prototype.getObjectCollectionId = function (isNode, clearSelection) {
        var id = [];
        var i = 0;
        var selectedObject = isNode ? this.diagram.selectedItems.nodes
            : this.diagram.selectedItems.connectors;
        while (!clearSelection && i < selectedObject.length) {
            id[i] = selectedObject[i].id;
            i++;
        }
        return id;
    };
    CommandHandler.prototype.updateBlazorSelectorModel = function (oldItemsCollection, clearSelection) {
        var blazorInterop = 'sfBlazor';
        if (window && window[blazorInterop]) {
            var i = 0;
            var nodes = [];
            var connectors = [];
            var oldItems = [];
            while (oldItemsCollection && i < oldItemsCollection.length) {
                oldItems[i] = oldItemsCollection[i].id;
                i++;
            }
            i = 0;
            nodes = this.getObjectCollectionId(true, clearSelection);
            connectors = this.getObjectCollectionId(false, clearSelection);
            var items = { nodes: nodes, connectors: connectors };
            var newItems = cloneBlazorObject(items);
            if (window[blazorInterop].updateDiagramCollection) {
                window[blazorInterop].updateDiagramCollection.call(this.diagram, 'selectedItems', newItems, oldItems, false, true);
            }
        }
    };
    /**
     * labelSelect method\
     *
     * @returns { void }    labelSelect method .\
     * @param {NodeModel | ConnectorModel} obj - provide the objects value.
     * @param {DiagramElement} textWrapper - provide the objects value.
     * @private
     */
    CommandHandler.prototype.labelSelect = function (obj, textWrapper) {
        this.oldSelectedObjects = cloneSelectedObjects(this.diagram);
        var selectorModel = (this.diagram.selectedItems);
        var isEnableServerDatabind = this.diagram.allowServerDataBinding;
        this.diagram.allowServerDataBinding = false;
        selectorModel.nodes = selectorModel.connectors = [];
        this.diagram.allowServerDataBinding = isEnableServerDatabind;
        if (obj instanceof Node) {
            selectorModel.nodes[0] = obj;
        }
        else {
            selectorModel.connectors[0] = obj;
        }
        selectorModel.annotation = (this.findTarget(textWrapper, obj));
        selectorModel.init(this.diagram);
        this.diagram.renderSelector(false);
        this.updateBlazorSelector();
    };
    /**
     * unSelect method\
     *
     * @returns { void }    unSelect method .\
     * @param {NodeModel | ConnectorModel} obj - provide the objects value.
     * @private
     */
    CommandHandler.prototype.unSelect = function (obj) {
        var objArray = [];
        objArray.push(obj);
        var items = (this.diagram.selectedItems.nodes.concat(this.diagram.selectedItems.connectors));
        var selectedObjects = items.filter(function (items) {
            return items.id !== obj.id;
        });
        var arg = {
            oldValue: items, newValue: selectedObjects, cause: this.diagram.diagramActions,
            state: 'Changing', type: 'Removal', cancel: false
        };
        if (!this.diagram.currentSymbol) {
            if (!isBlazor()) {
                this.diagram.triggerEvent(DiagramEvent.selectionChange, arg);
            }
        }
        if (isSelected(this.diagram, obj)) {
            var selectormodel = this.diagram.selectedItems;
            var index = void 0;
            if (obj instanceof Node) {
                index = selectormodel.nodes.indexOf(obj, 0);
                selectormodel.nodes.splice(index, 1);
            }
            else {
                index = selectormodel.connectors.indexOf(obj, 0);
                selectormodel.connectors.splice(index, 1);
            }
            index = selectormodel.selectedObjects.indexOf(obj, 0);
            selectormodel.selectedObjects.splice(index, 1);
            arg = {
                oldValue: items, newValue: selectedObjects, cause: this.diagram.diagramActions,
                state: 'Changed', type: 'Removal', cancel: false
            };
            this.updateBlazorSelectorModel(objArray);
            arg = {
                oldValue: cloneBlazorObject(items), newValue: selectedObjects, cause: this.diagram.diagramActions,
                state: 'Changed', type: 'Removal', cancel: arg.cancel
            };
            if (!arg.cancel) {
                index = selectormodel.wrapper.children.indexOf(obj.wrapper, 0);
                selectormodel.wrapper.children.splice(index, 1);
                this.diagram.updateSelector();
                if (!this.diagram.currentSymbol) {
                    if (isBlazor()) {
                        arg = this.updateSelectionChangeEventArgs(arg, [], objArray);
                        this.updateBlazorSelector();
                        if (window && window[this.blazor] && this.diagram.selectionChange) {
                            var eventObj = { 'EventName': 'selectionChange', args: JSON.stringify(arg) };
                            window[this.blazorInterop].updateBlazorDiagramEvents(eventObj, this.diagram);
                        }
                    }
                    else {
                        this.diagram.triggerEvent(DiagramEvent.selectionChange, arg);
                    }
                }
            }
        }
    };
    /**
     * getChildElements method\
     *
     * @returns { string[] }    getChildElements method .\
     * @param {DiagramElement[]} child - provide the objects value.
     * @private
     */
    CommandHandler.prototype.getChildElements = function (child) {
        var children = [];
        for (var i = 0; i < child.length; i++) {
            var childNode = child[i];
            if (childNode.children && childNode.children.length > 0) {
                children.concat(this.getChildElements(childNode.children));
            }
            else {
                children.push(childNode.id);
                if (childNode instanceof TextElement) {
                    children.push(childNode.id + '_text');
                }
            }
        }
        return children;
    };
    /**
     * moveSvgNode method\
     *
     * @returns { void }    moveSvgNode method .\
     * @param {string} nodeId - provide the objects value.
     * @param {string} targetID - provide the objects value.
     * @private
     */
    CommandHandler.prototype.moveSvgNode = function (nodeId, targetID) {
        var diagramDiv = getDiagramElement(targetID + '_groupElement', this.diagram.element.id);
        var backNode = getDiagramElement(nodeId + '_groupElement', this.diagram.element.id);
        diagramDiv.parentNode.insertBefore(backNode, diagramDiv);
    };
    /**
     * sendLayerBackward method\
     *
     * @returns { void }    sendLayerBackward method .\
     * @param {string} layerName - provide the objects value.
     * @private
     */
    CommandHandler.prototype.sendLayerBackward = function (layerName) {
        var layer = this.getLayer(layerName);
        if (layer && layer.zIndex !== 0) {
            var index = layer.zIndex;
            if (this.diagram.mode === 'SVG') {
                var currentLayerObject = layer.objects;
                var targetObject = this.getLayer(this.diagram.layerZIndexTable[index - 1]).objects[0];
                if (targetObject) {
                    for (var _i = 0, currentLayerObject_1 = currentLayerObject; _i < currentLayerObject_1.length; _i++) {
                        var obj = currentLayerObject_1[_i];
                        this.moveSvgNode(obj, targetObject);
                    }
                }
            }
            var targetLayer = this.getLayer(this.diagram.layerZIndexTable[index - 1]);
            targetLayer.zIndex = targetLayer.zIndex + 1;
            layer.zIndex = layer.zIndex - 1;
            var temp = this.diagram.layerZIndexTable[index];
            this.diagram.layerZIndexTable[index] = this.diagram.layerZIndexTable[index - 1];
            this.diagram.layerZIndexTable[index - 1] = temp;
            if (this.diagram.mode === 'Canvas') {
                this.diagram.refreshDiagramLayer();
            }
        }
    };
    /**
     * bringLayerForward method\
     *
     * @returns { void }    bringLayerForward method .\
     * @param {string} layerName - provide the objects value.
     * @private
     */
    CommandHandler.prototype.bringLayerForward = function (layerName) {
        var layer = this.getLayer(layerName);
        if (layer && layer.zIndex < this.diagram.layers.length - 1) {
            var index = layer.zIndex;
            var targetLayer = this.getLayer(this.diagram.layerZIndexTable[index + 1]);
            if (this.diagram.mode === 'SVG') {
                var currentLayerObject = layer.objects[0];
                var targetLayerObjects = targetLayer.objects;
                for (var _i = 0, targetLayerObjects_1 = targetLayerObjects; _i < targetLayerObjects_1.length; _i++) {
                    var obj = targetLayerObjects_1[_i];
                    if (obj) {
                        this.moveSvgNode(obj, currentLayerObject);
                    }
                }
            }
            targetLayer.zIndex = targetLayer.zIndex - 1;
            layer.zIndex = layer.zIndex + 1;
            var temp = this.diagram.layerZIndexTable[index];
            this.diagram.layerZIndexTable[index] = this.diagram.layerZIndexTable[index + 1];
            this.diagram.layerZIndexTable[index + 1] = temp;
            if (this.diagram.mode === 'Canvas') {
                this.diagram.refreshDiagramLayer();
            }
        }
    };
    /**
     * sendToBack method\
     *
     * @returns { void }    sendToBack method .\
     * @param {NodeModel | ConnectorModel} object - provide the objects value.
     * @private
     */
    CommandHandler.prototype.sendToBack = function (object) {
        this.diagram.protectPropertyChange(true);
        if (hasSelection(this.diagram) || object) {
            // EJ2-57772 - Added the below code to iterate all the selected nodes / connectors in the diagram and 
            // perform send to back operation
            var selectedItems = this.diagram.selectedItems;
            var objects = [];
            if (object && object.id) {
                objects.push(object);
            }
            else {
                objects = objects.concat(selectedItems.nodes);
                objects = objects.concat(selectedItems.connectors);
            }
            var objectId = (object && object.id);
            for (var i = 0; i < objects.length; i++) {
                var clonedObject = cloneObject(objects[i]);
                objectId = objects[i].id;
                var index = this.diagram.nameTable[objectId].zIndex;
                var layerNum = this.diagram.layers.indexOf(this.getObjectLayer(objectId));
                var zIndexTable = this.diagram.layers[layerNum].zIndexTable;
                var tempTable = JSON.parse(JSON.stringify(zIndexTable));
                var undoObject = cloneObject(this.diagram.selectedItems);
                var tempIndex = 0;
                //Checks whether the selected node is the only node in the node array.
                //Checks whether it is not a group and the nodes behind it are not it’s children.
                if (this.diagram.nodes.length !== 1 && (this.diagram.nameTable[objectId].children === undefined ||
                    this.checkObjectBehind(objectId, zIndexTable, index))) {
                    var obj = this.diagram.nameTable[objectId];
                    for (var i_2 = index; i_2 > 0; i_2--) {
                        if (zIndexTable[i_2]) {
                            //When there are empty records in the zindex table
                            if (!zIndexTable[i_2 - 1]) {
                                zIndexTable[i_2 - 1] = zIndexTable[i_2];
                                this.diagram.nameTable[zIndexTable[i_2 - 1]].zIndex = i_2;
                                delete zIndexTable[i_2];
                            }
                            else {
                                //bringing the objects forward
                                zIndexTable[i_2] = zIndexTable[i_2 - 1];
                                this.diagram.nameTable[zIndexTable[i_2]].zIndex = i_2;
                            }
                        }
                    }
                    for (var i_3 = index; i_3 > 0; i_3--) {
                        if (zIndexTable[i_3]) {
                            this.diagram.nameTable[zIndexTable[i_3]].zIndex = i_3;
                        }
                    }
                    if (obj.shape.type !== 'SwimLane') {
                        zIndexTable[0] = this.diagram.nameTable[objectId].id;
                        this.diagram.nameTable[objectId].zIndex = 0;
                    }
                    else {
                        tempIndex = this.swapZIndexObjects(index, zIndexTable, objectId, tempTable);
                    }
                    if (this.diagram.mode === 'SVG') {
                        var obj_1 = this.diagram.nameTable[objectId];
                        var i_4 = obj_1.shape.type !== 'SwimLane' ? 1 : tempIndex;
                        if (i_4 !== tempIndex) {
                            i_4 = (obj_1.children && obj_1.children.length > 0) ? index : 1;
                        }
                        var target = zIndexTable[i_4];
                        // EJ2-49326 - (CR issue fix) An exception raised when send the swimlane back to the normal node.
                        while (!target && i_4 < index) {
                            target = zIndexTable[++i_4];
                        }
                        // EJ2-46656 - CR issue fix
                        target = this.resetTargetNode(objectId, target, i_4, zIndexTable);
                        target = this.diagram.nameTable[target].parentId ? this.checkParentExist(target) : target;
                        this.moveSvgNode(objectId, target);
                        this.updateNativeNodeIndex(objectId);
                    }
                    else {
                        this.diagram.refreshCanvasLayers();
                    }
                    var redoObject = cloneObject(this.diagram.selectedItems);
                    var entry = { type: 'SendToBack', category: 'Internal', undoObject: undoObject, redoObject: redoObject };
                    if (!(this.diagram.diagramActions & DiagramAction.UndoRedo)) {
                        this.addHistoryEntry(entry);
                    }
                }
                this.triggerOrderCommand(clonedObject, objects[i], objects[i]);
            }
        }
        this.diagram.protectPropertyChange(false);
        if (isBlazor()) {
            this.getZIndexObjects();
        }
    };
    CommandHandler.prototype.swapZIndexObjects = function (index, zIndexTable, objectId, tempTable) {
        var tempIndex = 0;
        var childCount = 0;
        var childIndex = -1;
        var j = 1;
        // Get the swimlane's Children count
        for (var i = 0; i <= index; i++) {
            if (zIndexTable[i] && this.diagram.nameTable[zIndexTable[i]].parentId === objectId) {
                // Get the swimlane's first children position from z index table
                if (childIndex === -1) {
                    childIndex = i;
                }
                childCount++;
            }
        }
        // Swap the swimlane children to the top of the z index table
        for (var i = 0; i <= index; i++) {
            if (zIndexTable[i] && j <= childCount) {
                while (!zIndexTable[childIndex]) {
                    childIndex++;
                }
                zIndexTable[i] = zIndexTable[childIndex];
                this.diagram.nameTable[zIndexTable[i]].zIndex = i;
                childIndex++;
                j++;
            }
        }
        var k = 0;
        // Get the Z index from ZindexTable in the child's count position. In that position we want to put the swimlane
        for (var i = 0; i < childCount; i++) {
            while (!zIndexTable[k]) {
                k++;
            }
            tempIndex = this.diagram.nameTable[zIndexTable[k]].zIndex;
            k++;
        }
        tempIndex = tempIndex + 1;
        // Check if there is a object in the z index table or not
        while (!zIndexTable[tempIndex]) {
            ++tempIndex;
        }
        k = 0;
        // Place the swimlane at the next position of the swimlane's last children.
        zIndexTable[tempIndex] = this.diagram.nameTable[objectId].id;
        this.diagram.nameTable[objectId].zIndex = tempIndex;
        tempIndex = tempIndex + 1;
        // Now swap the intersect nodes at next position of the swimlane.
        for (var i = tempIndex; i <= index; i++) {
            if (zIndexTable[i]) {
                while (!tempTable[k]) {
                    k++;
                }
                zIndexTable[i] = tempTable[k];
                this.diagram.nameTable[zIndexTable[i]].zIndex = i;
                k++;
            }
        }
        return tempIndex;
    };
    CommandHandler.prototype.resetTargetNode = function (objectId, target, i, zIndexTable) {
        if (this.diagram.nameTable[objectId].shape.type === 'SwimLane'
            && this.diagram.nameTable[target].parentId != undefined && this.diagram.nameTable[target].parentId != "" && this.diagram.nameTable[this.diagram.nameTable[target].parentId].isLane) {
            i = i + 1;
            if (zIndexTable[i]) {
                target = zIndexTable[i];
                return target = this.resetTargetNode(objectId, target, i, zIndexTable);
            }
            else {
                return target;
            }
        }
        else {
            return target;
        }
    };
    CommandHandler.prototype.getZIndexObjects = function () {
        var element = [];
        var i;
        var j;
        for (i = 0; i < this.diagram.nodes.length; i++) {
            element.push(this.diagram.nodes[i]);
        }
        for (j = 0; j < this.diagram.connectors.length; j++) {
            element.push(this.diagram.connectors[j]);
        }
        this.updateBlazorZIndex(element);
    };
    CommandHandler.prototype.updateBlazorZIndex = function (element) {
        var blazorInterop = 'sfBlazor';
        var blazor = 'Blazor';
        var diagramobject = {};
        var nodeObject = [];
        var connectorObject = [];
        var k;
        if (element && element.length > 0) {
            for (k = 0; k < element.length; k++) {
                var elementObject = element[k];
                if (elementObject instanceof Node) {
                    nodeObject.push(this.getBlazorObject(elementObject));
                }
                else if (elementObject instanceof Connector) {
                    connectorObject.push(this.getBlazorObject(elementObject));
                }
            }
        }
        diagramobject = {
            nodes: nodeObject,
            connectors: connectorObject
        };
        if (window && window[blazor]) {
            var obj = { 'methodName': 'UpdateBlazorProperties', 'diagramobj': diagramobject };
            window[blazorInterop].updateBlazorProperties(obj, this.diagram);
        }
    };
    CommandHandler.prototype.getBlazorObject = function (objectName) {
        var object = {
            sfIndex: getIndex(this.diagram, objectName.id),
            zIndex: objectName.zIndex
        };
        return object;
    };
    //Checks whether the target is a child node.
    CommandHandler.prototype.checkParentExist = function (target) {
        var objBehind = target;
        while (this.diagram.nameTable[objBehind].parentId) {
            objBehind = this.diagram.nameTable[objBehind].parentId;
        }
        return objBehind;
    };
    //Checks whether the selected node is not a parent of another node.
    CommandHandler.prototype.checkObjectBehind = function (objectId, zIndexTable, index) {
        for (var i = 0; i < index; i++) {
            var z = zIndexTable[i];
            if (this.diagram.nameTable[z] && objectId !== this.diagram.nameTable[z].parentId) {
                return true;
            }
        }
        return false;
    };
    /**
     * bringToFront method\
     *
     * @returns {  void  }    bringToFront method .\
     *  @param {NodeModel | ConnectorModel } obj - Provide the nodeArray element .
     * @private
     */
    CommandHandler.prototype.bringToFront = function (obj) {
        var _this = this;
        this.diagram.protectPropertyChange(true);
        if (hasSelection(this.diagram) || obj) {
            // EJ2-57772 - Added the below code to iterate all the selected nodes / connectors in the diagram and 
            // perform bring to front operation
            var objectName_1 = (obj && obj.id);
            var selectedItems = this.diagram.selectedItems;
            var objects = [];
            if (obj && obj.id) {
                objects.push(obj);
            }
            else {
                objects = objects.concat(selectedItems.nodes);
                objects = objects.concat(selectedItems.connectors);
            }
            var _loop_1 = function (i) {
                var clonedObject = cloneObject(objects[i]);
                objectName_1 = objects[i].id;
                var layerNum = this_1.diagram.layers.indexOf(this_1.getObjectLayer(objectName_1));
                var zIndexTable = this_1.diagram.layers[layerNum].zIndexTable;
                var undoObject = cloneObject(this_1.diagram.selectedItems);
                var tempTable = JSON.parse(JSON.stringify(zIndexTable));
                var tempIndex = 0;
                //find the maximum zIndex of the tabel
                var tabelLength = Number(Object.keys(zIndexTable).sort(function (a, b) { return Number(a) - Number(b); }).reverse()[0]);
                var index = this_1.diagram.nameTable[objectName_1].zIndex;
                var oldzIndexTable = [];
                var length_1 = 0;
                for (var i_5 = 0; i_5 <= tabelLength; i_5++) {
                    oldzIndexTable.push(zIndexTable[i_5]);
                }
                var object = this_1.diagram.nameTable[objectName_1];
                if (object.shape.type === 'SwimLane') {
                    for (var i_6 = tabelLength; i_6 >= index; i_6--) {
                        if (zIndexTable[i_6] && !(this_1.diagram.nameTable[zIndexTable[i_6]].parentId === objectName_1)) {
                            length_1 = i_6;
                            tabelLength = length_1;
                            break;
                        }
                    }
                }
                for (var i_7 = index; i_7 < tabelLength; i_7++) {
                    //When there are empty records in the zindex table
                    if (zIndexTable[i_7]) {
                        if (!zIndexTable[i_7 + 1]) {
                            zIndexTable[i_7 + 1] = zIndexTable[i_7];
                            this_1.diagram.nameTable[zIndexTable[i_7 + 1]].zIndex = i_7;
                            delete zIndexTable[i_7];
                        }
                        else {
                            //bringing the objects backward
                            zIndexTable[i_7] = zIndexTable[i_7 + 1];
                            this_1.diagram.nameTable[zIndexTable[i_7]].zIndex = i_7;
                        }
                    }
                }
                for (var i_8 = index; i_8 < tabelLength; i_8++) {
                    if (zIndexTable[i_8]) {
                        this_1.diagram.nameTable[zIndexTable[i_8]].zIndex = i_8;
                    }
                }
                if (object.shape.type !== 'SwimLane') {
                    zIndexTable[tabelLength] = this_1.diagram.nameTable[objectName_1].id;
                    this_1.diagram.nameTable[objectName_1].zIndex = tabelLength;
                }
                else {
                    var childCount = 0;
                    var childIndex = -1;
                    var tempIndex_1 = 0;
                    var laneIndex = 0;
                    var cloneTable = JSON.parse(JSON.stringify(zIndexTable));
                    for (var i_9 = 0; i_9 <= index; i_9++) {
                        if (zIndexTable[i_9] && this_1.diagram.nameTable[zIndexTable[i_9]].parentId === objectName_1) {
                            if (childIndex === -1) {
                                childIndex = i_9;
                                tempIndex_1 = i_9;
                                break;
                            }
                        }
                    }
                    for (var i_10 = 0; i_10 <= tabelLength; i_10++) {
                        if (tempTable[i_10] && tempTable[i_10] !== objectName_1 && this_1.diagram.nameTable[tempTable[i_10]].parentId !== objectName_1) {
                            var node = this_1.diagram.nameTable[tempTable[i_10]];
                            var swimlaneObject = this_1.diagram.nameTable[objectName_1];
                            if (node.zIndex >= swimlaneObject.zIndex) {
                                childCount++;
                            }
                        }
                    }
                    var k = childIndex;
                    for (var i_11 = 0; i_11 <= childCount; i_11++) {
                        while (!zIndexTable[k]) {
                            k++;
                        }
                        laneIndex = this_1.diagram.nameTable[zIndexTable[k]].zIndex;
                        k++;
                    }
                    for (var i_12 = laneIndex; i_12 <= tabelLength; i_12++) {
                        while (!cloneTable[childIndex]) {
                            childIndex++;
                        }
                        while (!zIndexTable[i_12]) {
                            i_12++;
                        }
                        zIndexTable[i_12] = cloneTable[childIndex];
                        this_1.diagram.nameTable[zIndexTable[i_12]].zIndex = i_12;
                        childIndex++;
                    }
                    zIndexTable[tabelLength] = this_1.diagram.nameTable[objectName_1].id;
                    this_1.diagram.nameTable[objectName_1].zIndex = tabelLength;
                    k = index + 1;
                    var j = tempIndex_1;
                    for (var i_13 = 0; i_13 < childCount; i_13++) {
                        while (!tempTable[k]) {
                            k++;
                        }
                        while (this_1.diagram.nameTable[tempTable[k]].parentId === objectName_1) {
                            k++;
                        }
                        while (!zIndexTable[j]) {
                            j++;
                        }
                        zIndexTable[j] = tempTable[k];
                        this_1.diagram.nameTable[zIndexTable[j]].zIndex = j;
                        k++;
                        j++;
                    }
                }
                if (this_1.diagram.mode === 'SVG') {
                    var diagramLayer = this_1.diagram.diagramLayer;
                    //const child: string[] = this.getChildElements(this.diagram.nameTable[objectName].wrapper.children);
                    //const targerNodes: Object = [];
                    var element = getDiagramElement(objectName_1 + '_groupElement', this_1.diagram.element.id);
                    var nodes = this_1.diagram.selectedItems.nodes;
                    if (nodes.length > 0 && (nodes[0].shape.type === 'Native' || nodes[0].shape.type === 'HTML')) {
                        element.parentNode.removeChild(element);
                        for (var j = 0; j < this_1.diagram.views.length; j++) {
                            element = getDiagramElement(objectName_1 + (nodes[0].shape.type === 'HTML' ? '_html_element' : '_content_groupElement'), this_1.diagram.views[j]);
                            var lastChildNode = element.parentNode.lastChild;
                            lastChildNode.parentNode.insertBefore(element, lastChildNode.nextSibling);
                        }
                        var htmlLayer = getHTMLLayer(this_1.diagram.element.id);
                        this_1.diagram.diagramRenderer.renderElement(this_1.diagram.nameTable[objectName_1].wrapper, diagramLayer, htmlLayer);
                    }
                    else {
                        Object.keys(zIndexTable).forEach(function (key) {
                            var zIndexValue = zIndexTable[key];
                            if ((zIndexValue !== objectName_1) && (_this.diagram.nameTable[zIndexValue].parentId) !== objectName_1) {
                                //EJ2-42101 - SendToBack and BringToFront not working for connector with group node
                                //Added @Dheepshiva to restrict the objects with lower zIndex
                                if (zIndexValue !== undefined &&
                                    (oldzIndexTable.indexOf(objectName_1) < oldzIndexTable.indexOf(zIndexValue))) {
                                    var objectNode = _this.diagram.nameTable[objectName_1];
                                    var zIndexNode = _this.diagram.nameTable[zIndexValue];
                                    if (objectNode.parentId === '' && zIndexNode.parentId === '' && zIndexNode.parentId === undefined
                                        && objectNode.parentId !== zIndexNode.id) {
                                        _this.moveSvgNode(zIndexValue, objectName_1);
                                        _this.updateNativeNodeIndex(objectName_1);
                                    }
                                    else {
                                        if (_this.checkGroupNode(objectName_1, zIndexValue, _this.diagram.nameTable)) {
                                            _this.moveSvgNode(zIndexValue, objectName_1);
                                            _this.updateNativeNodeIndex(objectName_1);
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
                else {
                    this_1.diagram.refreshCanvasLayers();
                }
                var redoObject = cloneObject(this_1.diagram.selectedItems);
                var entry = { type: 'BringToFront', category: 'Internal', undoObject: undoObject, redoObject: redoObject };
                if (!(this_1.diagram.diagramActions & DiagramAction.UndoRedo)) {
                    this_1.addHistoryEntry(entry);
                }
                this_1.triggerOrderCommand(clonedObject, objects[i], objects[i]);
            };
            var this_1 = this;
            for (var i = 0; i < objects.length; i++) {
                _loop_1(i);
            }
        }
        this.diagram.protectPropertyChange(false);
        if (isBlazor()) {
            this.getZIndexObjects();
        }
    };
    CommandHandler.prototype.triggerOrderCommand = function (oldObj, newObj, obj) {
        var clonedObject = cloneObject(oldObj);
        var arg = {
            element: obj, cause: this.diagram.diagramActions,
            oldValue: clonedObject, newValue: newObj
        };
        this.diagram.triggerEvent(DiagramEvent.propertyChange, arg);
    };
    CommandHandler.prototype.checkGroupNode = function (selectedNodeName, layerObject, nameTable) {
        return nameTable[layerObject].parentId === nameTable[selectedNodeName].parentId;
    };
    /**
     * sortByZIndex method\
     *
     * @returns {  Object[] }    sortByZIndex method .\
     *  @param { Object[] } nodeArray - Provide the nodeArray element .
     *  @param { string } sortID - Provide the sortID element .
     * @private
     */
    CommandHandler.prototype.sortByZIndex = function (nodeArray, sortID) {
        var id = sortID ? sortID : 'zIndex';
        nodeArray = nodeArray.sort(function (a, b) {
            return a[id] - b[id];
        });
        return nodeArray;
    };
    /**
     * orderCommands method\
     *
     * @returns {  void }    orderCommands method .\
     *  @param { boolean } isRedo - Provide the previousObject element .
     *  @param { Selector } selector - Provide the previousObject element .
     *  @param { EntryType } action - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.orderCommands = function (isRedo, selector, action) {
        var selectedObject = selector.nodes;
        selectedObject = selectedObject.concat(selector.connectors);
        if (isRedo) {
            if (action === 'SendBackward') {
                this.sendBackward(selectedObject[0]);
            }
            else if (action === 'SendForward') {
                this.sendForward(selectedObject[0]);
            }
            else if (action === 'BringToFront') {
                this.bringToFront(selectedObject[0]);
            }
            else if (action === 'SendToBack') {
                this.sendToBack(selectedObject[0]);
            }
        }
        else {
            var startZIndex = selectedObject[0].zIndex;
            var endZIndex = this.diagram.nameTable[selectedObject[0].id].zIndex;
            var undoObject = selectedObject[0];
            var layer = this.getObjectLayer(undoObject.id);
            var layerIndex = layer.zIndex;
            var zIndexTable = layer.zIndexTable;
            if (action === 'SendBackward' || action === 'SendForward') {
                for (var i = 0; i < selectedObject.length; i++) {
                    var undoObject_1 = selectedObject[i];
                    var layer_2 = this.diagram.layers.indexOf(this.getObjectLayer(undoObject_1.id));
                    var node = this.diagram.nameTable[selectedObject[i].id];
                    node.zIndex = undoObject_1.zIndex;
                    this.diagram.layers[layer_2].zIndexTable[undoObject_1.zIndex] = undoObject_1.id;
                }
            }
            else if (action === 'BringToFront') {
                if (selectedObject[0].shape.type === 'SwimLane') {
                    this.sendToBack(selectedObject[0]);
                }
                else {
                    var k = 1;
                    for (var j = endZIndex; j > startZIndex; j--) {
                        if (zIndexTable[j]) {
                            if (!zIndexTable[j - k]) {
                                zIndexTable[j - k] = zIndexTable[j];
                                this.diagram.nameTable[zIndexTable[j - k]].zIndex = j;
                                delete zIndexTable[j];
                            }
                            else {
                                zIndexTable[j] = zIndexTable[j - k];
                                this.diagram.nameTable[zIndexTable[j]].zIndex = j;
                            }
                        }
                    }
                }
            }
            else if (action === 'SendToBack') {
                if (selectedObject[0].shape.type === 'SwimLane') {
                    this.bringToFront(selectedObject[0]);
                }
                else {
                    for (var j = endZIndex; j < startZIndex; j++) {
                        if (zIndexTable[j]) {
                            if (!zIndexTable[j + 1]) {
                                zIndexTable[j + 1] = zIndexTable[j];
                                this.diagram.nameTable[zIndexTable[j + 1]].zIndex = j;
                                delete zIndexTable[j];
                            }
                            else {
                                zIndexTable[j] = zIndexTable[j + 1];
                                this.diagram.nameTable[zIndexTable[j]].zIndex = j;
                            }
                        }
                    }
                }
            }
            if (action === 'BringToFront' || action === 'SendToBack') {
                var node = this.diagram.nameTable[selectedObject[0].id];
                node.zIndex = undoObject.zIndex;
                this.diagram.layers[layerIndex].zIndexTable[undoObject.zIndex] = undoObject.id;
            }
            if (this.diagram.mode === 'SVG') {
                if (action === 'SendBackward') {
                    this.moveObject(selectedObject[1].id, selectedObject[0].id);
                }
                else if (action === 'SendForward') {
                    this.moveObject(selectedObject[0].id, selectedObject[1].id);
                }
                else if (action === 'BringToFront') {
                    if (selectedObject[0].shape.type !== 'SwimLane') {
                        this.moveObject(selectedObject[0].id, zIndexTable[selectedObject[0].zIndex + 1]);
                    }
                }
                else if (action === 'SendToBack') {
                    if (selectedObject[0].shape.type !== 'SwimLane') {
                        var layer_3 = this.getObjectLayer(selectedObject[0].id);
                        for (var i = 0; i <= selectedObject[0].zIndex; i++) {
                            if (layer_3.objects[i] !== selectedObject[0].id) {
                                this.moveSvgNode(layer_3.objects[i], selectedObject[0].id);
                                this.updateNativeNodeIndex(selectedObject[0].id);
                            }
                        }
                    }
                }
            }
            else {
                this.diagram.refreshCanvasLayers();
            }
        }
    };
    CommandHandler.prototype.moveObject = function (sourceId, targetId) {
        if (targetId) {
            this.moveSvgNode(sourceId, targetId);
            this.updateNativeNodeIndex(sourceId, targetId);
        }
    };
    /**
     * sendForward method\
     *
     * @returns {  void }    sendForward method .\
     *  @param {  NodeModel | ConnectorModel } obj - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.sendForward = function (obj) {
        this.diagram.protectPropertyChange(true);
        if (hasSelection(this.diagram) || obj) {
            var elements = obj || (this.diagram.selectedItems.nodes.length ? this.diagram.selectedItems.nodes[0]
                : this.diagram.selectedItems.connectors[0]);
            var clonedObjects = cloneObject(elements);
            var nodeId = (obj && obj.id);
            nodeId = nodeId || (this.diagram.selectedItems.nodes.length ? this.diagram.selectedItems.nodes[0].id
                : this.diagram.selectedItems.connectors[0].id);
            var layerIndex = this.diagram.layers.indexOf(this.getObjectLayer(nodeId));
            var zIndexTable = this.diagram.layers[layerIndex].zIndexTable;
            //const tabelLength: number = Object.keys(zIndexTable).length;
            var index = this.diagram.nameTable[nodeId];
            var intersectArray = [];
            var temp = this.diagram.spatialSearch.findObjects(index.wrapper.bounds);
            if (temp.length > 2) {
                temp = this.sortByZIndex(temp);
            }
            for (var _i = 0, temp_1 = temp; _i < temp_1.length; _i++) {
                var i = temp_1[_i];
                if (index.id !== i.id) {
                    var currentLayer = this.getObjectLayer(i.id).zIndex;
                    if (layerIndex === currentLayer && (Number(this.diagram.nameTable[nodeId].zIndex) < Number(i.zIndex)) &&
                        index.wrapper.bounds.intersects(i.wrapper.bounds)) {
                        intersectArray.push(i);
                        break;
                    }
                }
            }
            if (intersectArray.length > 0) {
                var node = this.diagram.nameTable[zIndexTable[Number(intersectArray[0].zIndex)]];
                if (node.parentId) {
                    var parentId = '';
                    var parent_1 = findParentInSwimlane(node, this.diagram, parentId);
                    var obj_2 = this.diagram.nameTable[parent_1];
                    if (obj_2.id !== nodeId) {
                        intersectArray[0] = obj_2;
                    }
                }
                var overlapObject = intersectArray[0].zIndex;
                var currentObject = index.zIndex;
                var temp_2 = zIndexTable[overlapObject];
                //swap the nodes
                var undoObject = cloneObject(this.diagram.selectedItems);
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                (this.diagram.nameTable[temp_2] instanceof Node) ? undoObject.nodes.push(cloneObject(this.diagram.nameTable[temp_2])) :
                    undoObject.connectors.push(cloneObject(this.diagram.nameTable[temp_2]));
                this.diagram.layers[0].zIndexTable[overlapObject] = index.id;
                this.diagram.nameTable[zIndexTable[overlapObject]].zIndex = overlapObject;
                this.diagram.layers[0].zIndexTable[currentObject] = intersectArray[0].id;
                this.diagram.nameTable[zIndexTable[currentObject]].zIndex = currentObject;
                if (this.diagram.mode === 'SVG') {
                    this.moveSvgNode(zIndexTable[Number(intersectArray[0].zIndex)], nodeId);
                    this.updateNativeNodeIndex(zIndexTable[Number(intersectArray[0].zIndex)], nodeId);
                }
                else {
                    this.diagram.refreshCanvasLayers();
                }
                var redo = cloneObject(this.diagram.selectedItems);
                // eslint-disable-next-line
                (this.diagram.nameTable[temp_2] instanceof Node) ? redo.nodes.push(cloneObject(this.diagram.nameTable[temp_2])) :
                    redo.connectors.push(cloneObject(this.diagram.nameTable[temp_2]));
                var historyEntry = {
                    type: 'SendForward', category: 'Internal',
                    undoObject: undoObject, redoObject: redo
                };
                if (!(this.diagram.diagramActions & DiagramAction.UndoRedo)) {
                    this.addHistoryEntry(historyEntry);
                }
            }
            if (isBlazor()) {
                var elements_1 = [];
                elements_1.push(index);
                elements_1.push(intersectArray[intersectArray.length - 1]);
                this.updateBlazorZIndex(elements_1);
            }
            this.triggerOrderCommand(clonedObjects, elements, elements);
        }
        this.diagram.protectPropertyChange(false);
    };
    /**
     * sendBackward method\
     *
     * @returns {  void }    sendBackward method .\
     *  @param {  NodeModel | ConnectorModel } obj - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.sendBackward = function (obj) {
        this.diagram.protectPropertyChange(true);
        if (hasSelection(this.diagram) || obj) {
            var element = obj || (this.diagram.selectedItems.nodes.length ? this.diagram.selectedItems.nodes[0]
                : this.diagram.selectedItems.connectors[0]);
            var clonedObject = cloneObject(element);
            var objectId = (obj && obj.id);
            objectId = objectId || (this.diagram.selectedItems.nodes.length ? this.diagram.selectedItems.nodes[0].id
                : this.diagram.selectedItems.connectors[0].id);
            var layerNum = this.diagram.layers.indexOf(this.getObjectLayer(objectId));
            var zIndexTable = this.diagram.layers[layerNum].zIndexTable;
            //const tabelLength: number = Object.keys(zIndexTable).length;
            var node = this.diagram.nameTable[objectId];
            var intersectArray = [];
            var temp = this.diagram.spatialSearch.findObjects(node.wrapper.bounds);
            if (temp.length > 2) {
                temp = this.sortByZIndex(temp);
            }
            for (var _i = 0, temp_3 = temp; _i < temp_3.length; _i++) {
                var i = temp_3[_i];
                if (node.id !== i.id) {
                    var currentLayer = this.getObjectLayer(i.id).zIndex;
                    if (layerNum === currentLayer && (Number(this.diagram.nameTable[objectId].zIndex) > Number(i.zIndex)) &&
                        node.wrapper.bounds.intersects(i.wrapper.bounds)) {
                        intersectArray.push(i);
                    }
                }
            }
            for (var i = intersectArray.length - 1; i >= 0; i--) {
                var child = this.diagram.nameTable[intersectArray[i].id];
                if (child.parentId === objectId) {
                    intersectArray.splice(i, 1);
                }
            }
            if (intersectArray.length > 0) {
                var child = this.diagram.nameTable[intersectArray[intersectArray.length - 1].id];
                if (child.parentId) {
                    var parentId = '';
                    var parent_2 = findParentInSwimlane(child, this.diagram, parentId);
                    var obj_3 = this.diagram.nameTable[parent_2];
                    if (objectId !== obj_3.id) {
                        intersectArray[intersectArray.length - 1] = obj_3;
                    }
                }
                var overlapObject = intersectArray[intersectArray.length - 1].zIndex;
                var currentObject = node.zIndex;
                var temp_4 = zIndexTable[overlapObject];
                var undoObject = cloneObject(this.diagram.selectedItems);
                // eslint-disable-next-line
                (this.diagram.nameTable[temp_4] instanceof Node) ? undoObject.nodes.push(cloneObject(this.diagram.nameTable[temp_4])) :
                    undoObject.connectors.push(cloneObject(this.diagram.nameTable[temp_4]));
                //swap the nodes
                zIndexTable[overlapObject] = node.id;
                this.diagram.nameTable[zIndexTable[overlapObject]].zIndex = overlapObject;
                zIndexTable[currentObject] = intersectArray[intersectArray.length - 1].id;
                this.diagram.nameTable[zIndexTable[currentObject]].zIndex = currentObject;
                if (this.diagram.mode === 'SVG') {
                    this.moveSvgNode(objectId, zIndexTable[intersectArray[intersectArray.length - 1].zIndex]);
                    var node_2 = this.diagram.nameTable[zIndexTable[intersectArray[intersectArray.length - 1].zIndex]];
                    if (node_2.children && node_2.children.length > 0) {
                        this.updateNativeNodeIndex(objectId);
                    }
                    else {
                        this.updateNativeNodeIndex(objectId, zIndexTable[intersectArray[intersectArray.length - 1].zIndex]);
                    }
                    if (isBlazor()) {
                        var elements = [];
                        elements.push(node_2);
                        elements.push(intersectArray[intersectArray.length - 1]);
                        this.updateBlazorZIndex(elements);
                    }
                }
                else {
                    this.diagram.refreshCanvasLayers();
                }
                var redoObject = cloneObject(this.diagram.selectedItems);
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                (this.diagram.nameTable[temp_4] instanceof Node) ? redoObject.nodes.push(cloneObject(this.diagram.nameTable[temp_4])) :
                    redoObject.connectors.push(cloneObject(this.diagram.nameTable[temp_4]));
                var entry = { type: 'SendBackward', category: 'Internal', undoObject: undoObject, redoObject: redoObject };
                if (!(this.diagram.diagramActions & DiagramAction.UndoRedo)) {
                    this.addHistoryEntry(entry);
                }
                //swap the nodes
            }
            this.triggerOrderCommand(clonedObject, element, element);
        }
        this.diagram.protectPropertyChange(false);
    };
    /**
     * updateNativeNodeIndex method\
     *
     * @returns {  void }    updateNativeNodeIndex method .\
     *  @param { string } nodeId - Provide the previousObject element .
     *  @param { string } targetID - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.updateNativeNodeIndex = function (nodeId, targetID) {
        var node = this.diagram.selectedItems.nodes[0] || this.diagram.getObject(targetID);
        for (var i = 0; i < this.diagram.views.length; i++) {
            if (node && (node.shape.type === 'HTML'
                || node.shape.type === 'Native')) {
                var id = node.shape.type === 'HTML' ? '_html_element' : '_content_groupElement';
                var backNode = getDiagramElement(nodeId + id, this.diagram.views[i]);
                var diagramDiv = targetID ? getDiagramElement(targetID + id, this.diagram.views[i])
                    : backNode.parentElement.firstChild;
                if (backNode && diagramDiv) {
                    if (backNode.parentNode.id === diagramDiv.parentNode.id) {
                        diagramDiv.parentNode.insertBefore(backNode, diagramDiv);
                    }
                }
            }
        }
    };
    /**
     * initSelectorWrapper method\
     *
     * @returns {  void }    initSelectorWrapper method .\
     * @private
     */
    CommandHandler.prototype.initSelectorWrapper = function () {
        var selectorModel = this.diagram.selectedItems;
        selectorModel.init(this.diagram);
        if (selectorModel.nodes.length === 1 && selectorModel.connectors.length === 0) {
            selectorModel.rotateAngle = selectorModel.nodes[0].rotateAngle;
            selectorModel.wrapper.rotateAngle = selectorModel.nodes[0].rotateAngle;
            selectorModel.wrapper.pivot = selectorModel.nodes[0].pivot;
        }
    };
    /**
     * doRubberBandSelection method\
     *
     * @returns {  void }    doRubberBandSelection method .\
     *  @param { Rect } region - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.doRubberBandSelection = function (region) {
        this.clearSelectionRectangle();
        var selArray = [];
        var rubberArray = [];
        selArray = this.diagram.getNodesConnectors(selArray);
        if (this.diagram.selectedItems.rubberBandSelectionMode === 'CompleteIntersect') {
            rubberArray = completeRegion(region, selArray);
        }
        else {
            rubberArray = this.diagram.spatialSearch.findObjects(region);
        }
        if (rubberArray.length) {
            this.selectObjects(rubberArray, true);
        }
    };
    CommandHandler.prototype.clearSelectionRectangle = function () {
        var adornerSvg = getAdornerLayerSvg(this.diagram.element.id);
        var element = adornerSvg.getElementById(this.diagram.element.id + '_diagramAdorner_selected_region');
        if (element) {
            remove(element);
        }
    };
    /**
     * dragConnectorEnds method\
     *
     * @returns {  void }    dragConnectorEnds method .\
     *  @param { string } endPoint - Provide the previousObject element .
     *  @param { IElement } obj - Provide the previousObject element .
     *  @param { PointModel } point - Provide the point element .
     *  @param { BezierSegmentModel } segment - Provide the segment element .
     *  @param { IElement } target - Provide the target element .
     *  @param { string } targetPortId - Provide the targetPortId element .
     * @private
     */
    CommandHandler.prototype.dragConnectorEnds = function (endPoint, obj, point, segment, target, targetPortId) {
        var selectorModel;
        var connector; //let node: Node;
        var tx; //let segmentPoint: PointModel;
        var ty; //let index: number;
        var checkBezierThumb = false;
        if (obj instanceof Selector) {
            selectorModel = obj;
            connector = selectorModel.connectors[0];
        }
        else if (obj instanceof Connector && this.diagram.currentDrawingObject) {
            this.clearSelection();
            connector = this.diagram.currentDrawingObject;
        }
        if (endPoint === 'BezierSourceThumb' || endPoint === 'BezierTargetThumb') {
            checkBezierThumb = true;
            connector.isBezierEditing = true;
        }
        if (endPoint === 'ConnectorSourceEnd' || endPoint === 'BezierSourceThumb') {
            tx = point.x - (checkBezierThumb ? segment.bezierPoint1.x : connector.sourcePoint.x);
            ty = point.y - (checkBezierThumb ? segment.bezierPoint1.y : connector.sourcePoint.y);
            return this.dragSourceEnd(connector, tx, ty, null, point, endPoint, undefined, target, targetPortId, undefined, segment);
        }
        else {
            tx = point.x - (checkBezierThumb ? segment.bezierPoint2.x : connector.targetPoint.x);
            ty = point.y - (checkBezierThumb ? segment.bezierPoint2.y : connector.targetPoint.y);
            return this.dragTargetEnd(connector, tx, ty, null, point, endPoint, undefined, segment);
        }
    };
    /**
     * getSelectedObject method\
     *
     * @returns {  void }    getSelectedObject method .\
     * @private
     */
    CommandHandler.prototype.getSelectedObject = function () {
        var selectormodel = this.diagram.selectedItems;
        return (selectormodel.nodes).concat(selectormodel.connectors);
    };
    /**
     * updateBlazorProperties method\
     *
     * @returns {  void }    updateBlazorProperties method .\
     *  @param { boolean } isObjectInteraction - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.updateBlazorProperties = function (isObjectInteraction) {
        var blazorInterop = 'sfBlazor';
        var blazor = 'Blazor';
        if (!isObjectInteraction) {
            if (window && window[blazor]) {
                var obj = { 'methodName': 'UpdateBlazorProperties', 'diagramobj': this.diagramObject };
                window[blazorInterop].updateBlazorProperties(obj, this.diagram);
            }
        }
        else {
            if (window && window[blazor] && JSON.stringify(this.deepDiffer.diagramObject) !== '{}') {
                var obj = { 'methodName': 'UpdateBlazorProperties', 'diagramobj': this.deepDiffer.diagramObject };
                if (!this.diagram.isLoading) {
                    window[blazorInterop].updateBlazorProperties(obj, this.diagram);
                }
            }
        }
        //this.diagram.enableServerDataBinding(true);
        this.deepDiffer.newNodeObject = [];
        this.deepDiffer.newConnectorObject = [];
        this.diagramObject = [];
        this.diagram.oldNodeObjects = [];
        this.diagram.oldConnectorObjects = [];
    };
    /**
     * enableCloneObject method\
     *
     * @returns {  void }    enableCloneObject method .\
     *  @param { boolean } value - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.enableCloneObject = function (value) {
        if ((!this.diagram.lineRoutingModule || !(this.diagram.constraints & DiagramConstraints.LineRouting))) {
            this.diagram.canEnableBlazorObject = value;
        }
    };
    /**
     * ismouseEvents method\
     *
     * @returns {  void }    ismouseEvents method .\
     *  @param { boolean } value - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.ismouseEvents = function (value) {
        if (value) {
            this.diagram.blazorActions = this.diagram.addConstraints(this.diagram.blazorActions, BlazorAction.interaction);
        }
        else {
            this.diagram.blazorActions = this.diagram.removeConstraints(this.diagram.blazorActions, BlazorAction.interaction);
        }
    };
    /**
     * updateLayerObject method\
     *
     * @returns {  void }    updateLayerObject method .\
     *  @param { object } oldDiagram - Provide the previousObject element .
     *  @param { boolean } temp - Provide the temp element .
     * @private
     */
    CommandHandler.prototype.updateLayerObject = function (oldDiagram, temp) {
        if (isBlazor()) {
            var diffLayers = {};
            diffLayers = this.deepDiffer.getLayerObject(oldDiagram, temp, this.diagram);
            this.diagramObject = diffLayers;
            this.updateBlazorProperties();
        }
    };
    /* tslint:enable:no-string-literal */
    /**
     * getDiagramOldValues method\
     *
     * @returns {  void }    getDiagramOldValues method .\
     *  @param { object } oldDiagram - Provide the previousObject element .
     *  @param { string[] } attribute - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.getDiagramOldValues = function (oldDiagram, attribute) {
        var newDiagram = {};
        for (var i = 0; i < attribute.length; i++) {
            newDiagram[attribute[i]] = cloneObject(this.diagram[attribute[i]]);
        }
        var newObject = cloneObject(newDiagram);
        var result = this.deepDiffer.map(newObject, oldDiagram);
        var diffValue = this.deepDiffer.frameObject({}, result);
        var diff = this.deepDiffer.removeEmptyValues(diffValue);
        diff = this.deepDiffer.changeSegments(diff, newObject);
        this.diagramObject = diff;
        if (!(this.diagram.blazorActions & BlazorAction.ClearObject)) {
            this.updateBlazorProperties();
        }
    };
    /* tslint:disable */
    /**
     * getBlazorOldValues method\
     *
     * @returns {  void }    getBlazorOldValues method .\
     *  @param { MouseEventArgs } args - Provide the previousObject element .
     *  @param { boolean } labelDrag - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.getBlazorOldValues = function (args, labelDrag) {
        if (isBlazor()) {
            var oldNodeObject = this.diagram.oldNodeObjects;
            for (var i = 0; i < oldNodeObject.length; i++) {
                if (oldNodeObject[i].id) {
                    if (this.diagram.oldNodeObjects[i] instanceof Node) {
                        this.diagram.oldNodeObjects[i] = cloneBlazorObject(this.diagram.oldNodeObjects[i]);
                    }
                    this.deepDiffer.getDifferenceValues(this.diagram.nameTable[oldNodeObject[i].id], args, labelDrag, this.diagram);
                }
            }
            var oldConnectorObject = this.diagram.oldConnectorObjects;
            for (var i = 0; i < oldConnectorObject.length; i++) {
                if (oldConnectorObject[i].id) {
                    if (this.diagram.oldConnectorObjects[i] instanceof Connector) {
                        this.diagram.oldConnectorObjects[i] = cloneBlazorObject(this.diagram.oldConnectorObjects[i]);
                    }
                    this.deepDiffer.getDifferenceValues(this.diagram.nameTable[oldConnectorObject[i].id], args, labelDrag, this.diagram);
                }
            }
            if (oldNodeObject.length > 0 || oldConnectorObject.length > 0) {
                this.updateBlazorProperties(true);
            }
        }
    };
    /**
     * getObjectChanges method\
     *
     * @returns {  void }    getObjectChanges method .\
     *  @param { Object[] } previousObject - Provide the previousObject element .
     *  @param { Object[] } currentObject - Provide the previousObject element .
     *  @param { Object[] } previousObject - Provide the previousObject element .
     * @private
     */
    CommandHandler.prototype.getObjectChanges = function (previousObject, currentObject, changedNodes) {
        for (var i = 0; i < previousObject.length; i++) {
            var value = this.deepDiffer.map(currentObject[i], previousObject[i]);
            var result = this.deepDiffer.frameObject({}, value);
            var change = this.deepDiffer.removeEmptyValues(result);
            if (change.children) {
                change.children = cloneObject(currentObject[i]).children;
            }
            change = this.deepDiffer.changeSegments(change, currentObject[i]);
            change.sfIndex = getIndex(this.diagram, currentObject[i].id);
            changedNodes.push(change);
        }
    };
    /**
     * clearObjectSelection method\
     *
     * @returns {  void }    clearObjectSelection method .\
     *  @param { (NodeModel | ConnectorModel) } mouseDownElement - Provide the triggerAction element .
     * @private
     */
    // Bug fix - EJ2-44495 -Node does not gets selected on slight movement of mouse when drag constraints disabled for node
    CommandHandler.prototype.clearObjectSelection = function (mouseDownElement) {
        var selectedItems = this.diagram.selectedItems;
        var list = [];
        list = list.concat(selectedItems.nodes, selectedItems.connectors);
        if (list.indexOf(mouseDownElement) === -1) {
            this.clearSelection((list.length > 0) ? true : false);
            this.selectObjects([mouseDownElement], true);
        }
    };
    /**
     * clearSelection method\
     *
     * @returns {  void }    clearSelection method .\
     *  @param { boolean } triggerAction - Provide the triggerAction element .
     *  @param { boolean } isTriggered - Provide the isTriggered element .
     * @private
     */
    CommandHandler.prototype.clearSelection = function (triggerAction, isTriggered) {
        return __awaiter(this, void 0, void 0, function () {
            var enableServerDataBinding, selectormodel, arrayNodes, arg, blazarArgs, eventObj, selectNodes, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        enableServerDataBinding = this.diagram.allowServerDataBinding;
                        this.diagram.enableServerDataBinding(false);
                        if (!hasSelection(this.diagram)) return [3 /*break*/, 5];
                        selectormodel = this.diagram.selectedItems;
                        arrayNodes = this.getSelectedObject();
                        if (this.diagram.currentSymbol) {
                            this.diagram.previousSelectedObject = arrayNodes;
                        }
                        arg = {
                            oldValue: arrayNodes, newValue: [], cause: this.diagram.diagramActions,
                            state: 'Changing', type: 'Removal', cancel: false
                        };
                        this.updateBlazorSelectorModel(arrayNodes, true);
                        if (triggerAction) {
                            if (!isBlazor()) {
                                this.diagram.triggerEvent(DiagramEvent.selectionChange, arg);
                            }
                            else {
                                this.oldSelectedObjects = cloneObject(selectormodel);
                            }
                        }
                        if (!!arg.cancel) return [3 /*break*/, 4];
                        selectormodel.offsetX = 0;
                        selectormodel.offsetY = 0;
                        selectormodel.width = 0;
                        selectormodel.height = 0;
                        selectormodel.rotateAngle = 0;
                        selectormodel.nodes = [];
                        selectormodel.connectors = [];
                        selectormodel.wrapper = null;
                        selectormodel.annotation = undefined;
                        // EJ2-56919 - While clear selection empty the selectedObjects collection
                        selectormodel.selectedObjects = [];
                        this.diagram.clearSelectorLayer();
                        if (!triggerAction) return [3 /*break*/, 4];
                        arg = {
                            oldValue: cloneBlazorObject(arrayNodes), newValue: [], cause: this.diagram.diagramActions,
                            state: 'Changed', type: 'Removal', cancel: false
                        };
                        if (isBlazor()) {
                            arg = this.updateSelectionChangeEventArgs(arg, [], arrayNodes);
                            this.updateBlazorSelector();
                        }
                        if (!!isBlazor()) return [3 /*break*/, 1];
                        this.diagram.triggerEvent(DiagramEvent.selectionChange, arg);
                        return [3 /*break*/, 4];
                    case 1:
                        blazarArgs = void 0;
                        if (!(window && window[this.blazor] && this.diagram.selectionChange)) return [3 /*break*/, 3];
                        eventObj = { 'EventName': 'selectionChange', args: JSON.stringify(arg) };
                        return [4 /*yield*/, window[this.blazorInterop].updateBlazorDiagramEvents(eventObj, this.diagram)];
                    case 2:
                        blazarArgs = _a.sent();
                        _a.label = 3;
                    case 3:
                        // let blazarArgs: void | object = await this.diagram.triggerEvent(DiagramEvent.selectionChange, arg);
                        if (blazarArgs && blazarArgs.cancel && !isTriggered) {
                            selectNodes = [];
                            if (blazarArgs.oldValue.nodes.length > 0) {
                                selectNodes = blazarArgs.oldValue.nodes;
                            }
                            if (blazarArgs.oldValue.connectors.length > 0) {
                                selectNodes = selectNodes.concat(blazarArgs.oldValue.connectors);
                            }
                            if (selectNodes) {
                                for (i = 0; i < selectNodes.length; i++) {
                                    this.select(this.diagram.nameTable[selectNodes[i].id], (i !== 0 && selectNodes.length > 1) ? true : false);
                                }
                            }
                        }
                        _a.label = 4;
                    case 4:
                        this.updateBlazorSelector();
                        this.diagram.enableServerDataBinding(enableServerDataBinding);
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * clearSelectedItems method\
     *
     * @returns {  void }    clearSelectedItems method .\
     * @private
     */
    CommandHandler.prototype.clearSelectedItems = function () {
        var selectedNodes = this.diagram.selectedItems.nodes ? this.diagram.selectedItems.nodes.length : 0;
        var selectedConnectors = this.diagram.selectedItems.connectors ? this.diagram.selectedItems.connectors.length : 0;
        this.clearSelection((selectedNodes + selectedConnectors) > 0 ? true : false);
    };
    /**
     * removeStackHighlighter method\
     *
     * @returns {  void }    removeStackHighlighter method .\
     * @private
     */
    CommandHandler.prototype.removeStackHighlighter = function () {
        var adornerSvg = getAdornerLayerSvg(this.diagram.element.id);
        var highlighter = adornerSvg.getElementById(adornerSvg.id + '_stack_highlighter');
        if (highlighter) {
            highlighter.parentNode.removeChild(highlighter);
        }
    };
    /**
     * @param {End} args - provide the args  value.
     * @param {IElement} target - provide the target  value.
     * @private
     */
    CommandHandler.prototype.renderStackHighlighter = function (args, target) {
        var source = this.diagram.selectedItems.nodes[0];
        var symbolDrag;
        var node;
        var selectorModel;
        if (!target) {
            var objects = this.diagram.findObjectsUnderMouse(args.position);
            target = this.diagram.findObjectUnderMouse(objects, 'Drag', true);
            if (target && !(target.isLane || target.isPhase || target.isHeader)) {
                for (var i = 0; i < objects.length; i++) {
                    var laneNode = this.diagram.nameTable[objects[i].id];
                    if (!laneNode.isLane || laneNode.isPhase || laneNode.isHeader) {
                        target = laneNode;
                        this.diagram.parentObject = target;
                    }
                }
            }
        }
        if (source && target && target.isLane && source.shape && !source.shape.isPhase) {
            node = this.diagram.nameTable[target.parentId];
            if (this.diagram.currentSymbol && node.shape.type === 'SwimLane') {
                symbolDrag = true;
            }
            if ((source && !source.parentId && source.shape.type !== 'SwimLane') ||
                (source && source.parentId && this.diagram.nameTable[source.parentId] && this.diagram.nameTable[source.parentId].isLane &&
                    (source.parentId !== target.parentId && source.parentId !== target.id))) {
                selectorModel = this.diagram.selectedItems;
                var canvas = gridSelection(this.diagram, selectorModel, target.id, true);
                if (canvas) {
                    selectorModel.wrapper.children[0] = canvas;
                }
                this.diagram.renderSelector(false, true);
                selectorModel.wrapper.children[0] = selectorModel.nodes[0].wrapper;
            }
        }
        if (source && target && target.parentId && source.shape && source.shape.isPhase) {
            var node_3 = this.diagram.nameTable[target.parentId];
            if (node_3.shape.type === 'SwimLane') {
                this.diagram.selectedItems.wrapper.children[0] = this.diagram.nameTable[target.parentId].wrapper;
                this.diagram.renderSelector(false, true);
            }
        }
        if ((symbolDrag && this.diagram.currentSymbol.shape.isLane) || (source && target &&
            source.parentId && target.parentId && !source.isPhase && (source.parentId === target.parentId)
            && (source.id !== target.id) && node &&
            (node.container && (node.container.type === 'Stack' || node.container.type === 'Grid')))) {
            var canvas = void 0;
            var value = node.container.orientation === 'Vertical';
            var isVertical = node.container === 'Stack' ? value : !value;
            if (node.container.type === 'Grid' && target.isLane &&
                ((!this.diagram.currentSymbol &&
                    (node.shape.orientation === 'Horizontal' && target.rowIndex !== source.rowIndex) ||
                    (node.shape.orientation === 'Vertical' && target.columnIndex !== source.columnIndex))
                    || (this.diagram.currentSymbol &&
                        this.diagram.currentSymbol.shape.orientation === node.container.orientation))) {
                selectorModel = this.diagram.selectedItems;
                if ((source.isLane && canLaneInterchange(source, this.diagram)) || !source.isLane) {
                    canvas = gridSelection(this.diagram, selectorModel, target.id, symbolDrag);
                }
            }
            var wrapper = node.container.type === 'Stack' ? target.wrapper : canvas;
            if (wrapper) {
                renderStackHighlighter(wrapper, isVertical, args.position, this.diagram, false, true);
            }
        }
    };
    /** @private */
    CommandHandler.prototype.insertBlazorConnector = function (obj) {
        if (obj instanceof Selector) {
            for (var i = 0; i < obj.connectors.length; i++) {
                this.diagram.insertBlazorConnector(obj.connectors[i]);
            }
        }
        else {
            this.diagram.insertBlazorConnector(obj);
        }
    };
    /** @private */
    CommandHandler.prototype.drag = function (obj, tx, ty) {
        var tempNode;
        var elements = [];
        if (canMove(obj) && this.checkBoundaryConstraints(tx, ty, obj.wrapper.bounds) && canPageEditable(this.diagram)) {
            if (obj instanceof Node) {
                var oldValues = { offsetX: obj.offsetX, offsetY: obj.offsetY };
                obj.offsetX += tx;
                obj.offsetY += ty;
                if (obj.children && !(obj.container)) {
                    if (!(checkParentAsContainer(this.diagram, obj, true))) {
                        this.diagram.diagramActions = this.diagram.diagramActions | DiagramAction.isGroupDragging;
                    }
                    var nodes = this.getAllDescendants(obj, elements);
                    for (var i = 0; i < nodes.length; i++) {
                        tempNode = (this.diagram.nameTable[nodes[i].id]);
                        this.drag(tempNode, tx, ty);
                    }
                    this.updateInnerParentProperties(obj);
                    this.diagram.diagramActions = this.diagram.diagramActions & ~DiagramAction.isGroupDragging;
                }
                if (checkParentAsContainer(this.diagram, obj, true)) {
                    checkChildNodeInContainer(this.diagram, obj);
                }
                else {
                    if (obj && obj.shape && obj.shape.type === 'UmlClassifier') {
                        obj.wrapper.measureChildren = true;
                    }
                    this.diagram.nodePropertyChange(obj, oldValues, { offsetX: obj.offsetX, offsetY: obj.offsetY }, undefined, undefined, false);
                    obj.wrapper.measureChildren = false;
                }
                if (obj.shape.type === 'SwimLane' && !this.diagram.currentSymbol) {
                    var grid = obj.wrapper.children[0];
                    var connectors = getConnectors(this.diagram, grid, 0, true);
                    updateConnectorsProperties(connectors, this.diagram);
                }
            }
            else {
                var connector = obj;
                var oldValues = { sourcePoint: connector.sourcePoint, targetPoint: connector.targetPoint };
                var update = connector.type === 'Bezier' ? true : false;
                var hasEnds = false;
                if (!connector.sourceWrapper) {
                    this.dragSourceEnd(connector, tx, ty, true, null, '', update);
                }
                else {
                    hasEnds = true;
                }
                if (!connector.targetWrapper) {
                    this.dragTargetEnd(connector, tx, ty, true, null, '', update);
                }
                else {
                    hasEnds = true;
                }
                var canDragPoints = false;
                if (obj instanceof Connector) {
                    canDragPoints = true;
                }
                if (!hasEnds || canDragPoints) {
                    this.dragControlPoint(connector, tx, ty, true);
                    var conn = { sourcePoint: connector.sourcePoint, targetPoint: connector.targetPoint };
                    this.diagram.connectorPropertyChange(connector, oldValues, conn);
                }
            }
        }
    };
    /**   @private  */
    CommandHandler.prototype.connectorSegmentChange = function (actualObject, existingInnerBounds, isRotate) {
        var tx;
        var ty;
        var segmentChange = true;
        if (existingInnerBounds.equals(existingInnerBounds, actualObject.wrapper.bounds) === false) {
            if (actualObject.outEdges.length > 0) {
                for (var k = 0; k < actualObject.outEdges.length; k++) {
                    var connector = this.diagram.nameTable[actualObject.outEdges[k]];
                    if (connector.targetID !== '') {
                        segmentChange = this.isSelected(this.diagram.nameTable[connector.targetID]) ? false : true;
                    }
                    else {
                        segmentChange = this.isSelected(this.diagram.nameTable[connector.id]) ? false : true;
                    }
                    if (connector.type === 'Orthogonal' && connector.segments && connector.segments.length > 1) {
                        if (!isRotate) {
                            if (segmentChange) {
                                switch (connector.segments[0].direction) {
                                    case 'Bottom':
                                        tx = actualObject.wrapper.bounds.bottomCenter.x - existingInnerBounds.bottomCenter.x;
                                        ty = actualObject.wrapper.bounds.bottomCenter.y - existingInnerBounds.bottomCenter.y;
                                        break;
                                    case 'Top':
                                        tx = actualObject.wrapper.bounds.topCenter.x - existingInnerBounds.topCenter.x;
                                        ty = actualObject.wrapper.bounds.topCenter.y - existingInnerBounds.topCenter.y;
                                        break;
                                    case 'Left':
                                        tx = actualObject.wrapper.bounds.middleLeft.x - existingInnerBounds.middleLeft.x;
                                        ty = actualObject.wrapper.bounds.middleLeft.y - existingInnerBounds.middleLeft.y;
                                        break;
                                    case 'Right':
                                        tx = actualObject.wrapper.bounds.middleRight.x - existingInnerBounds.middleRight.x;
                                        ty = actualObject.wrapper.bounds.middleRight.y - existingInnerBounds.middleRight.y;
                                        break;
                                }
                                this.dragSourceEnd(connector, tx, ty, true, null, 'ConnectorSourceEnd', undefined, undefined, undefined, (actualObject.parentId &&
                                    (this.diagram.diagramActions & DiagramAction.isGroupDragging)) ? false : true);
                            }
                        }
                        else {
                            var firstSegment = connector.segments[0];
                            var secondSegment = connector.segments[1];
                            var cornerPoints = swapBounds(actualObject.wrapper, actualObject.wrapper.corners, actualObject.wrapper.bounds);
                            var sourcePoint = findPoint(cornerPoints, firstSegment.direction);
                            sourcePoint = getIntersection(connector, connector.sourceWrapper, sourcePoint, { x: connector.sourceWrapper.offsetX, y: connector.sourceWrapper.offsetY }, false);
                            var source = {
                                corners: undefined, point: sourcePoint, margin: undefined, direction: firstSegment.direction
                            };
                            var target = {
                                corners: undefined, point: secondSegment.points[1], margin: undefined, direction: undefined
                            };
                            var intermediatePoints = orthoConnection2Segment(source, target);
                            firstSegment.length = Point.distancePoints(intermediatePoints[0], intermediatePoints[1]);
                            if (secondSegment.direction && secondSegment.length) {
                                secondSegment.length = Point.distancePoints(intermediatePoints[1], intermediatePoints[2]);
                            }
                        }
                    }
                }
            }
        }
    };
    /** @private */
    CommandHandler.prototype.updateEndPoint = function (connector, oldChanges) {
        var conn = {
            sourcePoint: connector.sourcePoint, targetPoint: connector.targetPoint,
            sourceID: connector.sourceID ? connector.sourceID : undefined,
            targetID: connector.targetID ? connector.targetID : undefined,
            sourcePortID: connector.sourcePortID ? connector.sourcePortID : undefined,
            targetPortID: connector.targetPortID ? connector.targetPortID : undefined,
            segments: connector.segments ? connector.segments : undefined
        };
        var newValue = { sourcePoint: connector.sourcePoint, targetPoint: connector.targetPoint };
        if (connector.sourceID) {
            newValue.sourceID = connector.sourceID;
        }
        if (connector.targetID) {
            newValue.targetID = connector.targetID;
        }
        if (connector.sourcePortID) {
            newValue.sourcePortID = connector.sourcePortID;
        }
        if (connector.targetPortID) {
            newValue.targetPortID = connector.targetPortID;
        }
        if (connector.segments) {
            newValue.segments = connector.segments;
        }
        this.diagram.connectorPropertyChange(connector, oldChanges ? oldChanges : {}, newValue);
        // this.diagram.refreshDiagramLayer();
        this.diagram.updateSelector();
    };
    /**
     * @param obj
     * @param tx
     * @param ty
     * @param preventUpdate
     * @param point
     * @param endPoint
     * @param update
     * @param target
     * @param targetPortId
     * @param isDragSource
     * @param segment
     * @private
     */
    CommandHandler.prototype.dragSourceEnd = function (obj, tx, ty, preventUpdate, point, endPoint, update, target, targetPortId, isDragSource, segment) {
        var connector = this.diagram.nameTable[obj.id];
        var oldChanges = {};
        var checkBoundaryConstraints = this.checkBoundaryConstraints(tx, ty, connector.wrapper.bounds);
        if (canDragSourceEnd(connector) && checkBoundaryConstraints
            && (endPoint !== 'BezierSourceThumb') && canPageEditable(this.diagram)) {
            oldChanges = { sourcePoint: connector.sourcePoint };
            oldChanges = cloneObject(oldChanges);
            connector.sourcePoint.x += tx;
            connector.sourcePoint.y += ty;
            if (endPoint === 'ConnectorSourceEnd' && connector.type === 'Orthogonal') {
                this.changeSegmentLength(connector, target, targetPortId, isDragSource);
            }
            if (connector.shape.type === 'Bpmn' && connector.shape.sequence === 'Default') {
                this.updatePathElementOffset(connector);
            }
        }
        if (connector.type === 'Bezier') {
            oldChanges = { sourcePoint: connector.sourcePoint };
            if (segment) {
                this.translateBezierPoints(obj, (endPoint === '') ? 'ConnectorSourceEnd' : endPoint, tx, ty, segment, point, !update);
            }
            else {
                for (var i = 0; i < obj.segments.length; i++) {
                    this.translateBezierPoints(obj, (endPoint === '') ? 'ConnectorSourceEnd' : endPoint, tx, ty, obj.segments[i], point, !update);
                }
            }
        }
        if (!preventUpdate) {
            this.updateEndPoint(connector, oldChanges);
        }
        if (!(this.diagram.realActions & RealAction.AnimationClick)) {
            this.diagram.refreshCanvasLayers();
        }
        return checkBoundaryConstraints;
    };
    /**
     * Update Path Element offset
     */
    CommandHandler.prototype.updatePathElementOffset = function (connector) {
        connector.wrapper.children.splice(3, 1);
        var pathElement = new PathElement();
        var anglePoints = connector.intermediatePoints;
        pathElement = updatePathElement(anglePoints, connector);
        connector.wrapper.children.splice(3, 0, pathElement);
    };
    /**
     * Upadte the connector segments when change the source node
     */
    CommandHandler.prototype.changeSegmentLength = function (connector, target, targetPortId, isDragSource) {
        if (connector.segments && connector.segments[0].direction !== null
            && ((!target && connector.sourceID === '') || isDragSource)) {
            var first = connector.segments[0];
            var second = connector.segments[1];
            var node = this.diagram.nameTable[connector.sourceID];
            var secPoint = void 0;
            first.points[0] = connector.sourcePoint;
            if (first.direction === 'Top' || first.direction === 'Bottom') {
                first.points[first.points.length - 1].x = connector.sourcePoint.x;
                second.points[0].y = first.points[first.points.length - 1].y;
            }
            else {
                first.points[first.points.length - 1].y = connector.sourcePoint.y;
                second.points[0].x = first.points[first.points.length - 1].x;
            }
            if (first.direction && (first.length || first.length === 0)) {
                first.length = Point.distancePoints(first.points[0], first.points[first.points.length - 1]);
            }
            if (second.direction && (second.length || second.length === 0)) {
                second.length = Point.distancePoints(first.points[first.points.length - 1], second.points[second.points.length - 1]);
                second.direction = Point.direction(first.points[first.points.length - 1], second.points[second.points.length - 1]);
            }
            if (connector.sourcePortID !== '' && first.length < 10) {
                if (connector.segments.length > 2) {
                    var next = connector.segments[2];
                    var nextDirection = Point.direction(next.points[0], next.points[1]);
                    if (first.direction === getOppositeDirection(nextDirection)) {
                        if (first.direction === 'Right') {
                            next.points[0].x = first.points[first.points.length - 1].x = node.wrapper.corners.middleRight.x + 20;
                        }
                        else if (first.direction === 'Left') {
                            next.points[0].x = first.points[first.points.length - 1].x = node.wrapper.corners.middleLeft.x - 20;
                        }
                        else if (first.direction === 'Top') {
                            next.points[0].y = first.points[first.points.length - 1].y = node.wrapper.corners.topCenter.y - 20;
                        }
                        else {
                            next.points[0].y = first.points[first.points.length - 1].y = node.wrapper.corners.bottomCenter.y + 20;
                        }
                        if (next.direction && next.length) {
                            next.length = Point.distancePoints(next.points[0], next.points[next.points.length - 1]);
                        }
                        first.length = Point.distancePoints(first.points[0], first.points[first.points.length - 1]);
                    }
                    else if (first.direction === nextDirection && next.direction && next.length) {
                        if (first.direction === 'Top' || first.direction === 'Bottom') {
                            next.points[0] = first.points[0];
                            next.points[next.points.length - 1].x = next.points[0].x;
                        }
                        else {
                            next.points[0] = first.points[0];
                            next.points[next.points.length - 1].y = next.points[0].y;
                        }
                        next.length = Point.distancePoints(next.points[0], next.points[next.points.length - 1]);
                        connector.segments.splice(0, 2);
                    }
                    else {
                        first.length = 20;
                    }
                }
                else {
                    first.length = 20;
                }
            }
            else if (first.length < 1) {
                if (connector.sourceID !== '') {
                    if (second.direction === 'Right') {
                        secPoint = node.wrapper.corners.middleRight;
                        second.points[second.points.length - 1].y = secPoint.y;
                    }
                    else if (second.direction === 'Left') {
                        secPoint = node.wrapper.corners.middleLeft;
                        second.points[second.points.length - 1].y = secPoint.y;
                    }
                    else if (second.direction === 'Top') {
                        secPoint = node.wrapper.corners.topCenter;
                        second.points[second.points.length - 1].x = secPoint.x;
                    }
                    else {
                        secPoint = node.wrapper.corners.bottomCenter;
                        second.points[second.points.length - 1].x = secPoint.x;
                    }
                    second.length = Point.distancePoints(secPoint, second.points[second.points.length - 1]);
                    if (connector.segments.length > 2) {
                        var next = connector.segments[2];
                        if (next.direction && next.length) {
                            next.length = Point.distancePoints(second.points[second.points.length - 1], next.points[next.points.length - 1]);
                        }
                    }
                    connector.segments.splice(0, 1);
                }
                else {
                    connector.segments.splice(0, 1);
                }
            }
        }
        else {
            if (target && !targetPortId && connector.sourceID !== target.id &&
                connector.segments && connector.segments[0].direction !== null && target && target instanceof Node) {
                this.changeSourceEndToNode(connector, target);
            }
            if (target && targetPortId && connector.sourcePortID !== targetPortId &&
                connector.segments && connector.segments[0].direction !== null && target && target instanceof Node) {
                this.changeSourceEndToPort(connector, target, targetPortId);
            }
        }
    };
    /**
     * Change the connector endPoint to port
     */
    CommandHandler.prototype.changeSourceEndToPort = function (connector, target, targetPortId) {
        var port = this.diagram.getWrapper(target.wrapper, targetPortId);
        var point = { x: port.offsetX, y: port.offsetY };
        var direction = getPortDirection(point, cornersPointsBeforeRotation(target.wrapper), target.wrapper.bounds, false);
        var firstSegment = connector.segments[0];
        var secondSegment = connector.segments[1];
        if (firstSegment.direction !== direction) {
            var segments = [];
            var segValues = {};
            if (firstSegment.direction === getOppositeDirection(direction)) {
                segValues = {};
                var segValues1 = void 0;
                if (direction === 'Top' || direction === 'Bottom') {
                    segValues1 = (direction === 'Top') ? {
                        type: 'Orthogonal', isTerminal: true, direction: direction,
                        length: Math.abs(firstSegment.points[0].y - point.y)
                    } :
                        {
                            type: 'Orthogonal', isTerminal: true, direction: direction,
                            length: Math.abs(point.y - firstSegment.points[0].y)
                        };
                    segValues = (firstSegment.points[0].x > point.x) ?
                        { type: 'Orthogonal', isTerminal: true, direction: 'Right', length: (firstSegment.points[0].x - point.x) } :
                        { type: 'Orthogonal', isTerminal: true, direction: 'Left', length: (point.x - firstSegment.points[0].x) };
                }
                else {
                    segValues1 = (direction === 'Right') ? {
                        type: 'Orthogonal', isTerminal: true, direction: direction,
                        length: Math.abs(firstSegment.points[0].x - point.x)
                    } :
                        {
                            type: 'Orthogonal', isTerminal: true, direction: direction,
                            length: Math.abs(point.x - firstSegment.points[0].x)
                        };
                    segValues = (firstSegment.points[0].y > point.y) ?
                        { type: 'Orthogonal', direction: 'Top', isTerminal: true, length: (firstSegment.points[0].y - point.y) } :
                        { type: 'Orthogonal', direction: 'Bottom', isTerminal: true, length: (point.y - firstSegment.points[0].y) };
                }
                segments.push(new OrthogonalSegment(connector, 'segments', segValues1, true));
                segments.push(new OrthogonalSegment(connector, 'segments', segValues, true));
            }
            else {
                segValues = { type: 'Orthogonal', direction: direction, length: 20, isTerminal: true };
                segments.push(new OrthogonalSegment(connector, 'segments', segValues, true));
            }
            if (firstSegment.direction !== getOppositeDirection(direction)) {
                if (direction === 'Top' || direction === 'Bottom') {
                    firstSegment.points[0].x = point.x;
                    firstSegment.points[0].y = firstSegment.points[firstSegment.points.length - 1].y = (direction === 'Top') ?
                        point.y - 20 : point.y + 20;
                }
                else {
                    firstSegment.points[0].y = point.y;
                    firstSegment.points[0].x = firstSegment.points[firstSegment.points.length - 1].x = (direction === 'Right') ?
                        point.x + 20 : point.x - 20;
                }
                firstSegment.length = Point.distancePoints(firstSegment.points[0], firstSegment.points[firstSegment.points.length - 1]);
                secondSegment.length = Point.distancePoints(firstSegment.points[firstSegment.points.length - 1], secondSegment.points[secondSegment.points.length - 1]);
            }
            connector.segments = segments.concat(connector.segments);
        }
        else {
            firstSegment.points[0] = point;
            if (direction === 'Top' || direction === 'Bottom') {
                firstSegment.points[firstSegment.points.length - 1].x = point.x;
            }
            else {
                firstSegment.points[firstSegment.points.length - 1].y = point.y;
            }
            firstSegment.length = Point.distancePoints(firstSegment.points[0], firstSegment.points[firstSegment.points.length - 1]);
            secondSegment.length = Point.distancePoints(firstSegment.points[firstSegment.points.length - 1], secondSegment.points[secondSegment.points.length - 1]);
        }
    };
    /**
     * @param connector
     * @param changeTerminal
     * @private
Remove terinal segment in initial
     */
    CommandHandler.prototype.removeTerminalSegment = function (connector, changeTerminal) {
        for (var i = 0; i < connector.segments.length - 2; i++) {
            var segment = connector.segments[0];
            if (segment.isTerminal) {
                if (changeTerminal) {
                    segment.isTerminal = false;
                }
                else {
                    connector.segments.splice(i, 1);
                    i--;
                }
            }
        }
    };
    /**
     * Change the connector endPoint from point to node
     */
    CommandHandler.prototype.changeSourceEndToNode = function (connector, target) {
        this.removeTerminalSegment(connector);
        var sourceWrapper = target.wrapper.children[0].corners;
        var sourcePoint;
        var sourcePoint2;
        var firstSegment = connector.segments[0];
        var nextSegment = connector.segments[1];
        var segments = [];
        if (firstSegment.direction === 'Right' || firstSegment.direction === 'Left') {
            sourcePoint = (firstSegment.direction === 'Left') ? sourceWrapper.middleLeft : sourceWrapper.middleRight;
            if (firstSegment.length > sourceWrapper.width || ((firstSegment.direction === 'Left' &&
                sourcePoint.x >= firstSegment.points[0].x) || (firstSegment.direction === 'Right' &&
                sourcePoint.x <= firstSegment.points[0].x))) {
                firstSegment.points[0].y = firstSegment.points[firstSegment.points.length - 1].y = sourcePoint.y;
                firstSegment.points[0].x = sourcePoint.x;
                firstSegment.length = Point.distancePoints(firstSegment.points[0], firstSegment.points[firstSegment.points.length - 1]);
                nextSegment.length = Point.distancePoints(firstSegment.points[firstSegment.points.length - 1], nextSegment.points[nextSegment.points.length - 1]);
            }
            else {
                var direction = void 0;
                if (nextSegment.direction) {
                    direction = nextSegment.direction;
                }
                else {
                    direction = Point.direction(nextSegment.points[0], nextSegment.points[nextSegment.points.length - 1]);
                }
                sourcePoint2 = (direction === 'Bottom') ? sourceWrapper.bottomCenter : sourceWrapper.topCenter;
                if (nextSegment.length && nextSegment.direction) {
                    nextSegment.length =
                        (direction === 'Top') ? firstSegment.points[firstSegment.points.length - 1].y - (sourcePoint2.y + 20) :
                            (sourcePoint2.y + 20) - firstSegment.points[firstSegment.points.length - 1].y;
                }
                firstSegment.length = firstSegment.points[firstSegment.points.length - 1].x - sourcePoint2.x;
                firstSegment.direction = (firstSegment.length > 0) ? 'Right' : 'Left';
                var segValues = { type: 'Orthogonal', direction: direction, length: 20 };
                segments.push(new OrthogonalSegment(connector, 'segments', segValues, true));
                connector.segments = segments.concat(connector.segments);
            }
        }
        else {
            sourcePoint = (firstSegment.direction === 'Bottom') ? sourceWrapper.bottomCenter : sourceWrapper.topCenter;
            if (firstSegment.length > sourceWrapper.height || ((firstSegment.direction === 'Top' &&
                sourcePoint.y >= firstSegment.points[0].y) ||
                (firstSegment.direction === 'Bottom' && sourcePoint.y <= firstSegment.points[0].y))) {
                firstSegment.points[0].x = firstSegment.points[firstSegment.points.length - 1].x = sourcePoint.x;
                firstSegment.points[0].y = sourcePoint.y;
                firstSegment.length = Point.distancePoints(firstSegment.points[0], firstSegment.points[firstSegment.points.length - 1]);
                nextSegment.length = Point.distancePoints(firstSegment.points[firstSegment.points.length - 1], nextSegment.points[nextSegment.points.length - 1]);
            }
            else {
                sourcePoint2 = (nextSegment.direction === 'Left') ? sourceWrapper.middleLeft : sourceWrapper.middleRight;
                var direction = void 0;
                if (nextSegment.direction) {
                    direction = nextSegment.direction;
                }
                else {
                    direction = Point.direction(nextSegment.points[0], nextSegment.points[nextSegment.points.length - 1]);
                }
                if (nextSegment.length && nextSegment.direction) {
                    nextSegment.length =
                        (direction === 'Left') ? firstSegment.points[firstSegment.points.length - 1].x - (sourcePoint2.x + 20) :
                            (sourcePoint2.x + 20) - firstSegment.points[firstSegment.points.length - 1].x;
                }
                firstSegment.length = firstSegment.points[firstSegment.points.length - 1].y - sourcePoint2.y;
                firstSegment.direction = (firstSegment.length > 0) ? 'Bottom' : 'Top';
                var segValues = { type: 'Orthogonal', direction: direction, length: 20 };
                segments.push(new OrthogonalSegment(connector, 'segments', segValues, true));
                connector.segments = segments.concat(connector.segments);
            }
        }
    };
    //Translate the bezier points during the interaction
    CommandHandler.prototype.translateBezierPoints = function (connector, value, tx, ty, seg, point, update) {
        var index = (connector.segments.indexOf(seg));
        var segment = connector.segments[index];
        var prevSegment = index > 0 ? connector.segments[index - 1] : null;
        var startPoint = prevSegment != null ? prevSegment.point : connector.sourcePoint;
        var endPoint = index == connector.segments.length - 1 ? connector.targetPoint : segment.point;
        if (segment) {
            if (value === 'BezierSourceThumb' && (segment.vector1.angle || segment.vector1.distance)) {
                var oldDistance = segment.vector1.distance;
                var oldAngle = segment.vector1.angle;
                segment.vector1 = {
                    distance: connector.distance(startPoint, point),
                    angle: Point.findAngle(startPoint, point)
                };
                var deltaLength = segment.vector1.distance - oldDistance;
                var deltaAngle = segment.vector1.angle - oldAngle;
                this.translateSubsequentSegment(connector, seg, true, deltaLength, deltaAngle);
            }
            else if (value === 'BezierTargetThumb' && (segment.vector2.angle || segment.vector2.distance)) {
                var oldDistance = segment.vector2.distance;
                var oldAngle = segment.vector2.angle;
                segment.vector2 = {
                    distance: connector.distance(endPoint, point),
                    angle: Point.findAngle(endPoint, point)
                };
                var deltaLength = segment.vector2.distance - oldDistance;
                var deltaAngle = segment.vector2.angle - oldAngle;
                this.translateSubsequentSegment(connector, seg, false, deltaLength, deltaAngle);
            }
            else if ((value === 'ConnectorSourceEnd' && !connector.sourceID || value === 'ConnectorTargetEnd' && !connector.targetID)
                && update && isEmptyVector(segment.vector1) && isEmptyVector(segment.vector2)) {
                if (Point.isEmptyPoint(segment.point1)) {
                    segment.bezierPoint1 = getBezierPoints(connector.sourcePoint, connector.targetPoint);
                }
                if (Point.isEmptyPoint(segment.point2)) {
                    segment.bezierPoint2 = getBezierPoints(connector.targetPoint, connector.sourcePoint);
                }
            }
            else if (value === 'BezierSourceThumb' || (value === 'ConnectorSourceEnd' && !update && isEmptyVector(segment.vector1))) {
                segment.bezierPoint1.x += tx;
                segment.bezierPoint1.y += ty;
                if ((!Point.isEmptyPoint(segment.point1)) || (update)) {
                    segment.point1 = { x: segment.bezierPoint1.x, y: segment.bezierPoint1.y };
                }
            }
            else if (value === 'BezierTargetThumb' || (value === 'ConnectorTargetEnd' && !update && isEmptyVector(segment.vector2))) {
                segment.bezierPoint2.x += tx;
                segment.bezierPoint2.y += ty;
                if ((!Point.isEmptyPoint(segment.point2)) || (update)) {
                    segment.point2 = { x: segment.bezierPoint2.x, y: segment.bezierPoint2.y };
                }
            }
        }
    };
    CommandHandler.prototype.translateSubsequentSegment = function (connector, seg, isSourceEnd, deltaLength, deltaAngle) {
        var index = (connector.segments.indexOf(seg));
        var segment = connector.segments[index];
        if (!(connector.bezierSettings.smoothness & BezierSmoothness.SymmetricAngle)) {
            deltaAngle = null;
        }
        if (!(connector.bezierSettings.smoothness & BezierSmoothness.SymmetricDistance)) {
            deltaLength = null;
        }
        if (deltaLength == null && deltaAngle == null) {
            return;
        }
        if (isSourceEnd) {
            if (index != 0) {
                this.updatePreviousBezierSegment(connector, index, deltaLength, deltaAngle);
            }
        }
        else {
            if (index != connector.segments.length - 1) {
                this.updateNextBezierSegment(connector, index, deltaLength, deltaAngle);
            }
        }
    };
    CommandHandler.prototype.updatePreviousBezierSegment = function (connector, index, deltaLength, deltaAngle) {
        var segment = connector.segments[index - 1];
        var newDistance = segment.vector2.distance + deltaLength;
        var newAngle = (segment.vector2.angle + deltaAngle) % 360;
        if (newAngle < 0) {
            newAngle += 360;
        }
        segment.vector2 = { distance: newDistance, angle: newAngle };
    };
    CommandHandler.prototype.updateNextBezierSegment = function (connector, index, deltaLength, deltaAngle) {
        var segment = connector.segments[index + 1];
        var newDistance = segment.vector1.distance + deltaLength;
        var newAngle = (segment.vector1.angle + deltaAngle) % 360;
        if (newAngle < 0) {
            newAngle += 360;
        }
        segment.vector1 = { distance: newDistance, angle: newAngle };
    };
    /**
     * dragTargetEnd method \
     *
     * @returns { void }     dragTargetEnd method .\
     * @param {ConnectorModel} obj - provide the obj value.
     * @param {number} tx - provide the tx value.
     * @param {number} ty - provide the ty value.
     * @param {boolean} preventUpdate - provide the preventUpdate value.
     * @param {PointModel} point - provide the point value.
     * @param {string} endPoint - provide the endPoint value.
     * @param {boolean} update - provide the update value.
     * @param {OrthogonalSegmentModel | BezierSegmentModel | StraightSegmentModel} segment - provide the segment value.
     *
     * @private
     */
    CommandHandler.prototype.dragTargetEnd = function (obj, tx, ty, preventUpdate, point, endPoint, update, segment) {
        var connector = this.diagram.nameTable[obj.id];
        var oldChanges;
        var boundaryConstraints = this.checkBoundaryConstraints(tx, ty, connector.wrapper.bounds);
        if (canDragTargetEnd(connector) && endPoint !== 'BezierTargetThumb'
            && boundaryConstraints && canPageEditable(this.diagram)) {
            oldChanges = { targetPoint: connector.targetPoint };
            oldChanges = cloneObject(oldChanges);
            connector.targetPoint.x += tx;
            connector.targetPoint.y += ty;
            if (endPoint === 'ConnectorTargetEnd' && connector.type === 'Orthogonal' &&
                connector.segments && connector.segments.length > 0) {
                var prev = connector.segments[connector.segments.length - 2];
                if (prev && connector.segments[connector.segments.length - 1].points.length === 2) {
                    if (prev.direction === 'Left' || prev.direction === 'Right') {
                        prev.points[prev.points.length - 1].x = connector.targetPoint.x;
                    }
                    else {
                        prev.points[prev.points.length - 1].y = connector.targetPoint.y;
                    }
                    prev.length = Point.distancePoints(prev.points[0], prev.points[prev.points.length - 1]);
                    prev.direction = Point.direction(prev.points[0], prev.points[prev.points.length - 1]);
                }
            }
            if (connector.shape.type === 'Bpmn' && connector.shape.sequence === 'Default') {
                this.updatePathElementOffset(connector);
            }
        }
        if (connector.type === 'Bezier') {
            oldChanges = { targetPoint: connector.targetPoint };
            if (segment) {
                this.translateBezierPoints(obj, (endPoint === '') ? 'ConnectorTargetEnd' : endPoint, tx, ty, segment, point, !update);
            }
            else {
                for (var i = 0; i < obj.segments.length; i++) {
                    this.translateBezierPoints(obj, (endPoint === '') ? 'ConnectorTargetEnd' : endPoint, tx, ty, obj.segments[i], point, !update);
                }
            }
        }
        if (!preventUpdate) {
            this.updateEndPoint(connector, oldChanges);
        }
        if (!(this.diagram.realActions & RealAction.AnimationClick)) {
            this.diagram.refreshCanvasLayers();
        }
        return boundaryConstraints;
    };
    /**
     * dragControlPoint method \
     *
     * @returns { void }     dragControlPoint method .\
     * @param {ConnectorModel} obj - provide the obj value.
     * @param {number} tx - provide the tx value.
     * @param {number} ty - provide the ty value.
     * @param {boolean} preventUpdate - provide the preventUpdate value.
     * @param {number} segmentNumber - provide the segmentNumber value.
     *
     * @private
     */
    CommandHandler.prototype.dragControlPoint = function (obj, tx, ty, preventUpdate, segmentNumber) {
        var connector = this.diagram.nameTable[obj.id];
        if ((connector.type === 'Straight' || connector.type === 'Bezier') && connector.segments.length > 0) {
            if (segmentNumber !== undefined && connector.segments[segmentNumber]) {
                if (connector.type === 'Bezier') {
                    var seg = connector.segments[segmentNumber];
                    var isInternalSegment = seg.isInternalSegment;
                    if (!isInternalSegment || connector.bezierSettings == null || connector.bezierSettings.segmentEditOrientation == 'FreeForm') {
                        seg.point.x += tx;
                        seg.point.y += ty;
                    }
                    else {
                        if (seg.orientation == 'Horizontal') {
                            seg.point.x += tx;
                        }
                        else {
                            seg.point.y += ty;
                        }
                        this.updateDirectionalBezierCurve(connector);
                    }
                    if (isInternalSegment) {
                        connector.isBezierEditing = true;
                    }
                }
                else {
                    connector.segments[segmentNumber].point.x += tx;
                    connector.segments[segmentNumber].point.y += ty;
                }
            }
            else {
                for (var i = 0; i < connector.segments.length - 1; i++) {
                    connector.segments[i].point.x += tx;
                    connector.segments[i].point.y += ty;
                }
            }
            if (!preventUpdate) {
                this.updateEndPoint(connector);
            }
        }
        return true;
    };
    CommandHandler.prototype.updateDirectionalBezierCurve = function (connector) {
        if (connector.segments.length < 2) {
            return;
        }
        var pts = [];
        pts.push(connector.sourcePoint);
        for (var i = 0; i < connector.segments.length - 1; i++) {
            var seg = connector.segments[i];
            if (seg.orientation == 'Horizontal') {
                pts.push({ x: seg.point.x, y: pts[pts.length - 1].y });
            }
            else {
                pts.push({ x: pts[pts.length - 1].x, y: seg.point.y });
            }
            if (i == connector.segments.length - 2) {
                if (seg.orientation == 'Horizontal') {
                    pts.push({ x: seg.point.x, y: connector.targetPoint.y });
                }
                else {
                    pts.push({ x: connector.targetPoint.x, y: seg.point.y });
                }
            }
        }
        pts.push(connector.targetPoint);
        var start = pts[0];
        var end = pts[pts.length - 1];
        if (connector.segments.length > 1) {
            var mid1 = pts[1];
            var mid2 = pts[2];
            var center1 = { x: (mid1.x + mid2.x) * 0.5, y: (mid1.y + mid2.y) * 0.5 };
            var segment1 = connector.segments[0];
            segment1.vector1.angle = findAngle(start, mid1);
            segment1.vector1.distance = Point.findLength(start, mid1) * 0.5;
            segment1.vector2.angle = findAngle(center1, mid1);
            segment1.vector2.distance = Point.findLength(center1, mid1) * 0.5;
            segment1.point = center1;
            var segment2 = connector.segments[1];
            segment2.vector1.angle = findAngle(center1, mid2);
            segment2.vector1.distance = Point.findLength(center1, mid2) * 0.5;
            if (connector.segments.length > 2) {
                var mid3 = pts[3];
                var center2 = { x: (mid2.x + mid3.x) * 0.5, y: (mid2.y + mid3.y) * 0.5 };
                segment2.vector2.angle = findAngle(center2, mid2);
                segment2.vector2.distance = Point.findLength(center2, mid2) * 0.5;
                segment2.point = center2;
                var segment3 = connector.segments[2];
                segment3.vector1.angle = findAngle(center2, mid3);
                segment3.vector1.distance = Point.findLength(center2, mid3) * 0.5;
                if (connector.segments.length > 3) {
                    var mid4 = pts[4];
                    var center3 = { x: (mid3.x + mid4.x) * 0.5, y: (mid3.y + mid4.y) * 0.5 };
                    segment3.vector2.angle = findAngle(center3, mid3);
                    segment3.vector2.distance = Point.findLength(center3, mid3) * 0.5;
                    segment3.point = center3;
                    var segment4 = connector.segments[3];
                    segment4.vector1.angle = findAngle(center3, mid4);
                    segment4.vector1.distance = Point.findLength(center3, mid4) * 0.5;
                    segment4.vector2.angle = findAngle(end, mid4);
                    segment4.vector2.distance = Point.findLength(end, mid4) * 0.5;
                }
                else {
                    segment3.vector2.angle = findAngle(end, mid3);
                    segment3.vector2.distance = Point.findLength(end, mid3) * 0.5;
                }
            }
            else {
                segment2.vector2.angle = findAngle(end, mid2);
                segment2.vector2.distance = Point.findLength(end, mid2) * 0.5;
            }
        }
    };
    /**
     * rotatePropertyChnage method \
     *
     * @returns { void }     rotatePropertyChnage method .\
     * @param {number} angle - provide the obj value.
     *
     * @private
     */
    CommandHandler.prototype.rotatePropertyChnage = function (angle) {
        var selectedItems = this.diagram.selectedItems;
        var objects = [];
        objects = objects.concat(selectedItems.nodes);
        objects = objects.concat(selectedItems.connectors);
        var pivotValue = { x: selectedItems.offsetX, y: selectedItems.offsetY };
        this.rotateObjects(selectedItems, objects, angle - selectedItems.rotateAngle, pivotValue);
        selectedItems.wrapper.rotateAngle = selectedItems.rotateAngle = angle;
        this.diagram.updateSelector();
    };
    /**
     * rotateObjects method \
     *
     * @returns { void }     rotateObjects method .\
     * @param {NodeModel | SelectorModel} parent - provide the parent value.
     * @param {(NodeModel | ConnectorModel)[]} objects - provide the objects value.
     * @param {number} angle - provide the angle value.
     * @param {PointModel} pivot - provide the pivot value.
     * @param {boolean} includeParent - provide the includeParent value.
     *
     * @private
     */
    CommandHandler.prototype.rotateObjects = function (parent, objects, angle, pivot, includeParent) {
        pivot = pivot || {};
        var matrix = identityMatrix();
        rotateMatrix(matrix, angle, pivot.x, pivot.y);
        var oldValues;
        for (var _i = 0, objects_2 = objects; _i < objects_2.length; _i++) {
            var obj = objects_2[_i];
            if (obj instanceof Node) {
                if (canRotate(obj) && canPageEditable(this.diagram)) {
                    if (includeParent !== false || parent !== obj) {
                        oldValues = { rotateAngle: obj.rotateAngle };
                        obj.rotateAngle += angle;
                        obj.rotateAngle = (obj.rotateAngle + 360) % 360;
                        var newOffset = transformPointByMatrix(matrix, { x: obj.offsetX, y: obj.offsetY });
                        obj.offsetX = newOffset.x;
                        obj.offsetY = newOffset.y;
                        this.diagram.nodePropertyChange(obj, {}, { offsetX: obj.offsetX, offsetY: obj.offsetY, rotateAngle: obj.rotateAngle });
                    }
                    if (obj.processId) {
                        var parent_3 = this.diagram.nameTable[obj.processId];
                        var bound = this.diagram.bpmnModule.getChildrenBound(parent_3, obj.id, this.diagram);
                        this.diagram.bpmnModule.updateSubProcessess(bound, obj, this.diagram);
                    }
                    if (obj.children && obj.children.length && !obj.container) {
                        this.getChildren(obj, objects);
                    }
                }
            }
            else {
                this.rotatePoints(obj, angle, pivot || { x: obj.wrapper.offsetX, y: obj.wrapper.offsetY });
            }
            this.diagram.updateDiagramObject(obj);
        }
        this.diagram.refreshCanvasLayers();
        this.diagram.updateSelector();
    };
    /**
     * snapConnectorEnd method \
     *
     * @returns { PointModel }     snapConnectorEnd method .\
     * @param {PointModel} currentPosition - provide the parent value.
     *
     * @private
     */
    CommandHandler.prototype.snapConnectorEnd = function (currentPosition) {
        if ((this.diagram.snapSettings.constraints & SnapConstraints.SnapToLines)
            && this.snappingModule) {
            this.diagram.snappingModule.snapConnectorEnd(currentPosition);
        }
        return currentPosition;
    };
    /**
     * snapAngle method \
     *
     * @returns { number }     snapAngle method .\
     * @param {number} angle - provide the parent value.
     *
     * @private
     */
    CommandHandler.prototype.snapAngle = function (angle) {
        if ((this.diagram.snapSettings.constraints & SnapConstraints.SnapToLines)
            && this.snappingModule) {
            return this.snappingModule.snapAngle(this.diagram, angle);
        }
        else {
            return 0;
        }
    };
    /**
     * rotatePoints method \
     *
     * @returns { number }     rotatePoints method .\
     * @param {Connector} conn - provide the parent value.
     * @param {number} angle - provide the parent value.
     * @param {PointModel} pivot - provide the parent value.
     *
     * @private
     */
    CommandHandler.prototype.rotatePoints = function (conn, angle, pivot) {
        if (!conn.sourceWrapper || !conn.targetWrapper) {
            var matrix = identityMatrix();
            rotateMatrix(matrix, angle, pivot.x, pivot.y);
            conn.sourcePoint = transformPointByMatrix(matrix, conn.sourcePoint);
            conn.targetPoint = transformPointByMatrix(matrix, conn.targetPoint);
            if (conn.shape.type === 'Bpmn' && conn.shape.sequence === 'Default') {
                this.updatePathElementOffset(conn);
            }
            var newProp = { sourcePoint: conn.sourcePoint, targetPoint: conn.targetPoint };
            this.diagram.connectorPropertyChange(conn, {}, newProp);
            if (conn.segments && conn.segments.length > 0) {
                this.diagram.protectPropertyChange(true);
                var connector = conn;
                connector.segments = [];
                this.diagram.connectorPropertyChange(connector, {}, { segments: connector.segments });
                this.diagram.protectPropertyChange(false);
            }
        }
    };
    CommandHandler.prototype.updateInnerParentProperties = function (tempNode) {
        var elements = [];
        var protect = 'isProtectedOnChange';
        var protectChange = this.diagram[protect];
        this.diagram.protectPropertyChange(true);
        var innerParents = this.getAllDescendants(tempNode, elements, false, true);
        for (var i = 0; i < innerParents.length; i++) {
            var obj = this.diagram.nameTable[innerParents[i].id];
            obj.offsetX = obj.wrapper.offsetX;
            obj.offsetY = obj.wrapper.offsetY;
            obj.width = obj.wrapper.width;
            obj.height = obj.wrapper.height;
        }
        this.diagram.protectPropertyChange(protectChange);
    };
    /**
     * scale method \
     *
     * @returns { boolean }     scale method .\
     * @param {NodeModel | ConnectorModel} obj - provide the parent value.
     * @param {number} sw - provide the parent value.
     * @param {number} sh - provide the parent value.
     * @param {number} pivot - provide the parent value.
     * @param {number} refObject - provide the parent value.
     * @param {boolean} isOutsideBoundary - provide the parent value.
     *
     * @private
     */
    // eslint-disable-next-line max-len
    CommandHandler.prototype.scale = function (obj, sw, sh, pivot, refObject, isOutsideBoundary) {
        var node = this.diagram.nameTable[obj.id];
        var tempNode = node;
        var elements = [];
        var element = node.wrapper;
        if (!refObject) {
            refObject = obj;
        }
        var refWrapper = refObject.wrapper;
        var x = refWrapper.offsetX - refWrapper.actualSize.width * refWrapper.pivot.x;
        var y = refWrapper.offsetY - refWrapper.actualSize.height * refWrapper.pivot.y;
        var refPoint = getPoint(x, y, refWrapper.actualSize.width, refWrapper.actualSize.height, refWrapper.rotateAngle, refWrapper.offsetX, refWrapper.offsetY, pivot);
        if (element.actualSize.width !== undefined && element.actualSize.height !== undefined && canPageEditable(this.diagram)) {
            if (tempNode.children && !(tempNode.container)) {
                var nodes = this.getAllDescendants(tempNode, elements);
                for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    var temp = nodes_1[_i];
                    this.scaleObject(sw, sh, refPoint, temp, element, refObject);
                }
                obj.wrapper.measure(new Size());
                obj.wrapper.arrange(obj.wrapper.desiredSize);
                this.diagram.updateGroupOffset(node);
                this.updateInnerParentProperties(tempNode);
            }
            else {
                this.scaleObject(sw, sh, refPoint, node, element, refObject);
            }
            var bounds = getBounds(obj.wrapper);
            var checkBoundaryConstraints = this.checkBoundaryConstraints(undefined, undefined, bounds);
            if (!checkBoundaryConstraints && isOutsideBoundary) {
                this.scale(obj, 1 / sw, 1 / sh, pivot, undefined, true);
                return false;
            }
            this.diagram.updateDiagramObject(obj);
        }
        return true;
    };
    /** @private */
    CommandHandler.prototype.getAllDescendants = function (node, nodes, includeParent, innerParent) {
        var temp = node;
        var parentNodes = [];
        for (var i = 0; i < temp.children.length; i++) {
            node = (this.diagram.nameTable[temp.children[i]]);
            if (node) {
                if (!node.children) {
                    nodes.push(node);
                }
                else {
                    if (includeParent) {
                        nodes.push(node);
                    }
                    if (innerParent) {
                        parentNodes.push(node);
                    }
                    nodes = this.getAllDescendants(node, nodes);
                }
            }
        }
        return (innerParent) ? parentNodes : nodes;
    };
    /**
     * getChildren method \
     *
     * @returns { (NodeModel | ConnectorModel)[]): (NodeModel | ConnectorModel)[] }     getChildren method .\
     * @param {NodeModel} node - provide the sw value.
     * @param {(NodeModel | ConnectorModel)[]} nodes - provide the sw value.
     *
     * @private
     */
    CommandHandler.prototype.getChildren = function (node, nodes) {
        var temp = node;
        if (node.children) {
            for (var i = 0; i < temp.children.length; i++) {
                node = (this.diagram.nameTable[temp.children[i]]);
                nodes.push(node);
            }
        }
        return nodes;
    };
    /**
     * scaleObject method \
     *
     * @returns { NodeModel }     scaleObject method .\
     * @param {string} id - provide the sw value.
     *
     * @private
     */
    CommandHandler.prototype.cloneChild = function (id) {
        var node = this.diagram.nameTable[id];
        return node;
    };
    /**
     * scaleObject method \
     *
     * @returns { void }     scaleObject method .\
     * @param {End} sw - provide the sw value.
     * @param {End} sh - provide the sh value.
     * @param {PointModel} pivot - provide the pivot value.
     * @param {IElement} obj - provide the pivot value.
     * @param {DiagramElement} element - provide the element value.
     * @param {IElement} refObject - provide the refObject value.
     *
     * @private
     */
    CommandHandler.prototype.scaleObject = function (sw, sh, pivot, obj, element, refObject, canUpdate) {
        sw = sw < 0 ? 1 : sw;
        sh = sh < 0 ? 1 : sh;
        var oldValues = {};
        if (sw !== 1 || sh !== 1) {
            var width = void 0;
            var height = void 0;
            if (obj instanceof Node) {
                var node = obj;
                var isResize = void 0;
                var bound = void 0;
                oldValues = {
                    width: obj.wrapper.actualSize.width, height: obj.wrapper.actualSize.height,
                    offsetX: obj.wrapper.offsetX, offsetY: obj.wrapper.offsetY,
                    margin: { top: node.margin.top, left: node.margin.left }
                };
                if (node.shape.type === 'Bpmn' && node.shape.activity.subProcess.processes
                    && node.shape.activity.subProcess.processes.length > 0) {
                    bound = this.diagram.bpmnModule.getChildrenBound(node, node.id, this.diagram);
                    isResize = node.wrapper.bounds.containsRect(bound);
                }
                width = node.wrapper.actualSize.width * sw;
                height = node.wrapper.actualSize.height * sh;
                if (node.maxWidth !== undefined && node.maxWidth !== 0) {
                    width = Math.min(node.maxWidth, width);
                }
                if (node.minWidth !== undefined && node.minWidth !== 0) {
                    width = Math.max(node.minWidth, width);
                }
                if (node.maxHeight !== undefined && node.maxHeight !== 0) {
                    height = Math.min(node.maxHeight, height);
                }
                if (node.minHeight !== undefined && node.minHeight !== 0) {
                    height = Math.max(node.minHeight, height);
                }
                if (isResize) {
                    width = Math.max(width, (bound.right - node.wrapper.bounds.x));
                    height = Math.max(height, (bound.bottom - node.wrapper.bounds.y));
                }
                sw = width / node.actualSize.width;
                sh = height / node.actualSize.height;
            }
            var matrix = identityMatrix(); // let refWrapper: DiagramElement;
            if (!refObject) {
                refObject = obj;
            }
            var refWrapper = refObject.wrapper;
            rotateMatrix(matrix, -refWrapper.rotateAngle, pivot.x, pivot.y);
            scaleMatrix(matrix, sw, sh, pivot.x, pivot.y);
            rotateMatrix(matrix, refWrapper.rotateAngle, pivot.x, pivot.y);
            if (obj instanceof Node) {
                var node = obj; //let left: number; let top: number;
                var newPosition = transformPointByMatrix(matrix, { x: node.wrapper.offsetX, y: node.wrapper.offsetY });
                var oldleft = node.wrapper.offsetX - node.wrapper.actualSize.width * node.pivot.x;
                var oldtop = node.wrapper.offsetY - node.wrapper.actualSize.height * node.pivot.y;
                if (width > 0) {
                    if (node.processId) {
                        var parent_4 = this.diagram.nameTable[node.processId];
                        if (!parent_4.maxWidth || ((node.margin.left + width) < parent_4.maxWidth)) {
                            node.width = width;
                            node.offsetX = newPosition.x;
                        }
                    }
                    else {
                        node.width = width;
                        node.offsetX = newPosition.x;
                    }
                }
                if (height > 0) {
                    if (node.processId) {
                        var parent_5 = this.diagram.nameTable[node.processId];
                        if (!parent_5.maxHeight || ((node.margin.top + height) < parent_5.maxHeight)) {
                            node.height = height;
                            node.offsetY = newPosition.y;
                        }
                    }
                    else {
                        node.height = height;
                        node.offsetY = newPosition.y;
                    }
                }
                var left = node.wrapper.offsetX - node.wrapper.actualSize.width * node.pivot.x;
                var top_1 = node.wrapper.offsetY - node.wrapper.actualSize.height * node.pivot.y;
                var parent_6 = this.diagram.nameTable[node.processId];
                if (parent_6 && ((node.margin.top + (top_1 - oldtop)) <= 0 ||
                    (node.margin.left + (left - oldleft) <= 0))) {
                    this.diagram.nodePropertyChange(obj, {}, {
                        margin: { top: node.margin.top, left: node.margin.left }
                    });
                }
                else {
                    if (checkParentAsContainer(this.diagram, obj, true)) {
                        checkChildNodeInContainer(this.diagram, obj);
                    }
                    else {
                        if (!canUpdate) {
                            this.diagram.nodePropertyChange(obj, oldValues, {
                                width: node.width, height: node.height, offsetX: node.offsetX, offsetY: node.offsetY,
                                margin: { top: node.margin.top + (top_1 - oldtop), left: node.margin.left + (left - oldleft) }
                            });
                        }
                    }
                }
            }
            else {
                var connector = obj;
                var oldValues_1 = { sourcePoint: connector.sourcePoint, targetPoint: connector.targetPoint };
                if (!connector.sourceWrapper || !connector.targetWrapper) {
                    this.scaleConnector(connector, matrix, oldValues_1, sw, sh, pivot);
                }
            }
            var parentNode = this.diagram.nameTable[obj.processId];
            if (parentNode) {
                var parent_7 = parentNode.wrapper.bounds;
                var child = obj.wrapper.bounds;
                var bound = this.diagram.bpmnModule.getChildrenBound(parentNode, obj.id, this.diagram);
                this.diagram.bpmnModule.updateSubProcessess(bound, obj, this.diagram);
            }
        }
    };
    CommandHandler.prototype.scaleConnector = function (connector, matrix, oldValues, sw, sh, pivot) {
        connector.sourcePoint = transformPointByMatrix(matrix, connector.sourcePoint);
        connector.targetPoint = transformPointByMatrix(matrix, connector.targetPoint);
        if (connector.shape.type === 'Bpmn' && connector.shape.sequence === 'Default') {
            this.updatePathElementOffset(connector);
        }
        var newProp = { sourcePoint: connector.sourcePoint, targetPoint: connector.targetPoint };
        this.diagram.connectorPropertyChange(connector, oldValues, newProp);
        var selector = this.diagram.selectedItems;
        if (selectionHasConnector(this.diagram, selector)) {
            var clonedSelectedItems = cloneObject(this.diagram.selectedItems);
            var nodeModel = {
                offsetX: clonedSelectedItems.offsetX, offsetY: clonedSelectedItems.offsetY,
                height: clonedSelectedItems.height, width: clonedSelectedItems.width, rotateAngle: clonedSelectedItems.rotateAngle
            };
            var obj = new Node(this.diagram, 'nodes', nodeModel, true);
            obj.wrapper = clonedSelectedItems.wrapper;
            obj.wrapper.rotateAngle = selector.rotateAngle;
            this.scaleObject(sw, sh, pivot, obj, obj.wrapper, obj, true);
            selector.wrapper.actualSize.width = obj.width;
            selector.wrapper.actualSize.height = obj.height;
            selector.wrapper.offsetX = obj.offsetX;
            selector.wrapper.offsetY = obj.offsetY;
            var child = this.diagram.selectedItems.connectors[0];
            if (child.id !== connector.id) {
                this.measureSelector(selector);
            }
        }
    };
    CommandHandler.prototype.measureSelector = function (selector) {
        var desiredBounds = undefined;
        //Measuring the children
        var clonedSelectedItems = cloneObject(this.diagram.selectedItems);
        var objects = [];
        var bounds;
        objects = clonedSelectedItems.connectors;
        var pivot = { x: this.diagram.selectedItems.offsetX, y: this.diagram.selectedItems.offsetY };
        for (var i = 0; i < objects.length; i++) {
            var matrix_1 = identityMatrix();
            rotateMatrix(matrix_1, -selector.rotateAngle, pivot.x, pivot.y);
            objects[i].sourcePoint = transformPointByMatrix(matrix_1, objects[i].sourcePoint);
            objects[i].targetPoint = transformPointByMatrix(matrix_1, objects[i].targetPoint);
            var p1 = { x: objects[i].sourcePoint.x, y: objects[i].sourcePoint.y };
            var p2 = { x: objects[i].targetPoint.x, y: objects[i].targetPoint.y };
            bounds = (this.calculateBounds(p1, p2));
            if (desiredBounds === undefined) {
                desiredBounds = bounds;
            }
            else {
                desiredBounds.uniteRect(bounds);
            }
        }
        var offsetPt = {};
        if (desiredBounds !== undefined) {
            offsetPt = {
                x: desiredBounds.x + desiredBounds.width * selector.wrapper.pivot.x,
                y: desiredBounds.y + desiredBounds.height * selector.wrapper.pivot.y
            };
        }
        var nodeModel = {
            offsetX: offsetPt.x, offsetY: offsetPt.y,
            height: desiredBounds.height, width: desiredBounds.width, rotateAngle: 0
        };
        var obj = new Node(this.diagram, 'nodes', nodeModel, true);
        var matrix = identityMatrix();
        rotateMatrix(matrix, selector.rotateAngle, pivot.x, pivot.y);
        obj.rotateAngle += selector.rotateAngle;
        obj.rotateAngle = (obj.rotateAngle + 360) % 360;
        var newOffset = transformPointByMatrix(matrix, { x: obj.offsetX, y: obj.offsetY });
        obj.offsetX = newOffset.x;
        obj.offsetY = newOffset.y;
        selector.wrapper.actualSize.width = desiredBounds.width;
        selector.wrapper.actualSize.height = desiredBounds.height;
        selector.wrapper.offsetX = obj.offsetX;
        selector.wrapper.offsetY = obj.offsetY;
        var selectorEle = getSelectorElement(this.diagram.element.id);
        this.diagram.diagramRenderer.renderResizeHandle(selector.wrapper, selectorEle, selector.thumbsConstraints, this.diagram.scroller.currentZoom, selector.constraints, this.diagram.scroller.transform, false, canMove(selector));
    };
    CommandHandler.prototype.calculateBounds = function (p1, p2) {
        var left = Math.min(p1.x, p2.x);
        var right = Math.max(p1.x, p2.x);
        var top = Math.min(p1.y, p2.y);
        var bottom = Math.max(p1.y, p2.y);
        var width = right - left;
        var height = bottom - top;
        var rect = new Rect(left, top, width, height);
        return rect;
    };
    /**
     * portDrag method \
     *
     * @returns { void }     portDrag method .\
     * @param { NodeModel | ConnectorModel} obj - provide the obj value.
     * @param {DiagramElement} portElement - provide the portElement value.
     * @param {number} tx - provide the tx value.
     * @param {number} ty - provide the tx value.
     *
     * @private
     */
    CommandHandler.prototype.portDrag = function (obj, portElement, tx, ty) {
        var oldValues;
        var changedvalues;
        var port = this.findTarget(portElement, obj);
        var bounds = getBounds(obj.wrapper);
        if (port && canDrag(port, this.diagram)) {
            oldValues = this.getPortChanges(obj, port);
            port.offset.x += (tx / bounds.width);
            port.offset.y += (ty / bounds.height);
            changedvalues = this.getPortChanges(obj, port);
            this.diagram.nodePropertyChange(obj, oldValues, changedvalues);
            this.diagram.updateDiagramObject(obj);
        }
    };
    /** @private */
    CommandHandler.prototype.labelDrag = function (obj, textElement, tx, ty) {
        //let changedvalues: Object;
        //let label: ShapeAnnotationModel | PathAnnotationModel;
        // eslint-disable-next-line max-len
        var label = this.findTarget(textElement, obj);
        var bounds = cornersPointsBeforeRotation(obj.wrapper);
        var oldValues = this.getAnnotationChanges(obj, label);
        if (label instanceof ShapeAnnotation) {
            label.offset.x += (tx / bounds.width);
            label.offset.y += (ty / bounds.height);
        }
        else {
            this.updatePathAnnotationOffset(obj, label, tx, ty);
            if (label instanceof PathAnnotation) {
                label.alignment = 'Center';
            }
        }
        var changedvalues = this.getAnnotationChanges(obj, label);
        if (obj instanceof Node) {
            this.diagram.nodePropertyChange(obj, oldValues, changedvalues);
        }
        else {
            this.diagram.connectorPropertyChange(obj, oldValues, changedvalues);
        }
        this.diagram.updateDiagramObject(obj);
        if (!isSelected(this.diagram, label, false, textElement)) {
            this.labelSelect(obj, textElement);
        }
    };
    CommandHandler.prototype.updatePathAnnotationOffset = function (object, label, tx, ty, newPosition, size) {
        var textWrapper = this.diagram.getWrapper(object.wrapper, label.id);
        var offsetX = textWrapper.offsetX;
        var offsetY = textWrapper.offsetY;
        var offset;
        var intermediatePoints = object.intermediatePoints;
        var prev;
        var pointLength = 0;
        var totalLength = 0;
        var intersectingOffset;
        var currentPosition;
        switch (label.verticalAlignment) {
            case "Center":
                if (label.horizontalAlignment == 'Center') {
                    currentPosition = (newPosition) ? newPosition : { x: offsetX + tx, y: offsetY + ty };
                }
                else if (label.horizontalAlignment == 'Right') {
                    currentPosition = (newPosition) ? newPosition : { x: offsetX + (textWrapper.outerBounds.width) / 2 + tx, y: offsetY + ty };
                }
                else if (label.horizontalAlignment == 'Left') {
                    currentPosition = (newPosition) ? newPosition : { x: offsetX - (textWrapper.outerBounds.width) / 2 + tx, y: offsetY + ty };
                }
                break;
            case "Top":
                if (label.horizontalAlignment == 'Center') {
                    currentPosition = (newPosition) ? newPosition : { x: offsetX + tx, y: offsetY - (textWrapper.outerBounds.height) / 2 + ty };
                }
                else if (label.horizontalAlignment == 'Right') {
                    currentPosition = (newPosition) ? newPosition : { x: offsetX + (textWrapper.outerBounds.width) / 2 + tx, y: offsetY - (textWrapper.outerBounds.height) / 2 + ty };
                }
                else if (label.horizontalAlignment == 'Left') {
                    currentPosition = (newPosition) ? newPosition : { x: offsetX - (textWrapper.outerBounds.width) / 2 + tx, y: offsetY - (textWrapper.outerBounds.height) / 2 + ty };
                }
                break;
            case "Bottom":
                if (label.horizontalAlignment == 'Center') {
                    currentPosition = (newPosition) ? newPosition : { x: offsetX + tx, y: offsetY + (textWrapper.outerBounds.height) / 2 + ty };
                }
                else if (label.horizontalAlignment == 'Right') {
                    currentPosition = (newPosition) ? newPosition : { x: offsetX + (textWrapper.outerBounds.width) / 2 + tx, y: offsetY + (textWrapper.outerBounds.height) / 2 + ty };
                }
                else if (label.horizontalAlignment == 'Left') {
                    currentPosition = (newPosition) ? newPosition : { x: offsetX - (textWrapper.outerBounds.width) / 2 + tx, y: offsetY + (textWrapper.outerBounds.height) / 2 + ty };
                }
                break;
        }
        var intersetingPts = this.getInterceptWithSegment(currentPosition, intermediatePoints);
        var newOffset = intermediatePoints[intermediatePoints.length - 1];
        totalLength = Point.getLengthFromListOfPoints(intermediatePoints);
        if (intersetingPts.length > 0) {
            if (label.dragLimit.top || label.dragLimit.bottom || label.dragLimit.left || label.dragLimit.right) {
                var minDistance = { minDistance: null };
                newOffset = this.getRelativeOffset(currentPosition, intermediatePoints, minDistance);
                var distance = { minDistance: null };
                intersectingOffset = this.getRelativeOffset(currentPosition, intersetingPts, distance);
                if (minDistance != null && distance.minDistance < minDistance.minDistance) {
                    newOffset = intersectingOffset;
                }
                else {
                    var connectorOffset = getOffsetOfConnector(object.intermediatePoints, label);
                    newOffset = connectorOffset.point;
                }
            }
            else {
                intersectingOffset = intersetingPts[intersetingPts.length - 1];
                newOffset = intersectingOffset;
            }
            if (newOffset) {
                var p = void 0;
                var bounds = void 0;
                for (p = 0; p < intermediatePoints.length; p++) {
                    if (prev != null) {
                        bounds = Rect.toBounds([prev, intermediatePoints[p]]);
                        if (bounds.containsPoint(newOffset)) {
                            pointLength += Point.findLength(prev, newOffset);
                            break;
                        }
                        else {
                            pointLength += Point.findLength(prev, intermediatePoints[p]);
                        }
                    }
                    prev = intermediatePoints[p];
                }
                offset = { x: pointLength / totalLength, y: 0 };
            }
            this.updateLabelMargin(object, label, offset, currentPosition, size, tx, ty);
        }
        else {
            this.updateLabelMargin(object, label, null, currentPosition, size, tx, ty);
        }
    };
    CommandHandler.prototype.getRelativeOffset = function (currentPosition, points, minDistance) {
        var newOffset;
        var distance;
        var pt;
        var i;
        for (i = 0; i < points.length; i++) {
            pt = points[i];
            distance = Math.round(Math.sqrt(Math.pow((currentPosition.x - pt.x), 2) +
                Math.pow((currentPosition.y - pt.y), 2)));
            if (minDistance.minDistance === null ||
                Math.min(Math.abs(minDistance.minDistance), Math.abs(distance)) === Math.abs(distance)) {
                newOffset = pt;
                minDistance.minDistance = distance;
            }
        }
        return newOffset;
    };
    CommandHandler.prototype.dragLimitValue = function (label, point, tempPt, contentDimension) {
        var x = false;
        var y = false;
        if ((tempPt.x >= (point.x - label.dragLimit.left - (contentDimension.width / 2))) &&
            (tempPt.x <= point.x + label.dragLimit.right + (contentDimension.width / 2))) {
            x = true;
        }
        if ((tempPt.y >= (point.y - label.dragLimit.top - (contentDimension.height / 2))) &&
            (tempPt.y <= point.y + label.dragLimit.bottom + (contentDimension.height / 2))) {
            y = true;
        }
        return { x: x, y: y };
    };
    /* eslint-disable */
    CommandHandler.prototype.updateLabelMargin = function (node, label, offset, tempPt, size, tx, ty) {
        offset = offset ? offset : { x: label.offset, y: 0 };
        if (label && offset && offset.x > 0 && offset.x < 1) {
            //let point: PointModel;
            var length_2 = Point.getLengthFromListOfPoints(node.intermediatePoints);
            var point = this.getPointAtLength(length_2 * offset.x, node.intermediatePoints, 0);
            var curZoomfactor = this.diagram.scrollSettings.currentZoom;
            var dragLimit = label.dragLimit;
            if (dragLimit.top || dragLimit.bottom || dragLimit.left || dragLimit.right) {
                var labelBounds = this.diagram.getWrapper(node.wrapper, label.id);
                var contentDimension = new Rect(0, 0, 0, 0);
                var annotationWrtapper = this.diagram.getWrapper(node.wrapper, label.id);
                contentDimension.x = ((annotationWrtapper).offsetX / curZoomfactor) + tx;
                contentDimension.y = (annotationWrtapper.offsetY / curZoomfactor) + ty;
                contentDimension.width = annotationWrtapper.bounds.width / curZoomfactor;
                contentDimension.height = annotationWrtapper.bounds.height / curZoomfactor;
                var draggableBounds = new Rect(point.x - (dragLimit.left || 0) - contentDimension.width / 2, point.y - (dragLimit.top || 0) - contentDimension.height / 2, (dragLimit.left || 0) + (dragLimit.right || 0) + contentDimension.width, (dragLimit.top || 0) + (dragLimit.bottom || 0) + contentDimension.height);
                if (draggableBounds.containsPoint(tempPt)) {
                    tempPt = tempPt;
                }
                else {
                    var lineIntersects = void 0;
                    var line1 = [point, tempPt];
                    lineIntersects = this.boundsInterSects(line1, draggableBounds, false);
                    for (var _i = 0, lineIntersects_1 = lineIntersects; _i < lineIntersects_1.length; _i++) {
                        var i = lineIntersects_1[_i];
                        var ptt = i;
                        tempPt = ptt;
                    }
                }
                var cursorLimit = this.dragLimitValue(label, point, tempPt, contentDimension);
                label.margin = {
                    left: cursorLimit.x ? tempPt.x - point.x : label.margin.left,
                    top: cursorLimit.y ? tempPt.y - point.y : label.margin.top, right: 0, bottom: 0
                };
            }
            else {
                label.margin = { left: tempPt.x - point.x, top: tempPt.y - point.y, right: 0, bottom: 0 };
            }
            label.offset = offset.x;
            if (size) {
                label.width = size.width;
                label.height = size.height;
            }
        }
    };
    CommandHandler.prototype.boundsInterSects = function (polyLine, bounds, self) {
        var intersects;
        if (bounds) {
            var polyLine2 = [
                { x: bounds.x, y: bounds.y },
                { x: bounds.x + bounds.width, y: bounds.y },
                { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
                { x: bounds.x, y: bounds.y + bounds.height },
                { x: bounds.x, y: bounds.y }
            ];
            intersects = this.intersect(polyLine, polyLine2, self);
        }
        return intersects;
    };
    CommandHandler.prototype.intersect = function (polyLine1, polyLine2, self) {
        var intersect = [];
        for (var i = 0; i < polyLine1.length - 1; i++) {
            for (var j = 0; j < polyLine2.length - 1; j++) {
                var p = intersect2(polyLine1[i], polyLine1[i + 1], polyLine2[j], polyLine2[j + 1]);
                if (p.x !== 0 && p.y !== 0) {
                    intersect.push(p);
                }
            }
        }
        return intersect;
    };
    CommandHandler.prototype.getPointAtLength = function (length, points, angle) {
        angle = 0;
        var run = 0;
        var pre;
        var found = { x: 0, y: 0 };
        var pt;
        for (var i = 0; i < points.length; i++) {
            pt = points[i];
            if (!pre) {
                pre = pt;
                continue;
            }
            else {
                var l = Point.findLength(pre, pt);
                var r = void 0;
                var deg = void 0;
                var x = void 0;
                var y = void 0;
                if (run + l >= length) {
                    r = length - run;
                    deg = Point.findAngle(pre, pt);
                    x = r * Math.cos(deg * Math.PI / 180);
                    y = r * Math.sin(deg * Math.PI / 180);
                    found = { x: pre.x + x, y: pre.y + y };
                    angle = deg;
                    break;
                }
                else {
                    run += l;
                }
            }
            pre = pt;
        }
        return found;
    };
    CommandHandler.prototype.getInterceptWithSegment = function (currentPosition, conPoints) {
        var intercepts = [];
        var imgLine = [];
        var segemnt = [];
        var tarAngle;
        var srcAngle; //let maxLength: number;
        var maxLength = Point.findLength({ x: 0, y: 0 }, { x: this.diagram.scroller.viewPortWidth, y: this.diagram.scroller.viewPortHeight });
        for (var i = 1; i < conPoints.length; i++) {
            segemnt = [conPoints[i - 1], conPoints[i]];
            imgLine = [];
            srcAngle = Math.round(Point.findAngle(segemnt[0], segemnt[1]) % 360);
            tarAngle = Math.round(Point.findAngle(segemnt[1], segemnt[0]) % 360);
            var angleAdd = (srcAngle > 0 && srcAngle <= 90) || (srcAngle > 180 && srcAngle <= 270) ? 90 : -90;
            imgLine.push(Point.transform(currentPosition, srcAngle + angleAdd, maxLength));
            imgLine.push(Point.transform(currentPosition, tarAngle + angleAdd, maxLength));
            var lineUtil1 = { x1: segemnt[0].x, y1: segemnt[0].y, x2: segemnt[1].x, y2: segemnt[1].y };
            var lineUtil2 = { x1: imgLine[0].x, y1: imgLine[0].y, x2: imgLine[1].x, y2: imgLine[1].y };
            var line3 = intersect3(lineUtil1, lineUtil2);
            if (line3.enabled) {
                intercepts.push(line3.intersectPt);
            }
        }
        return intercepts;
    };
    /** @private */
    CommandHandler.prototype.getAnnotationChanges = function (object, label) {
        var index = findObjectIndex(object, label.id, true);
        var annotations = {};
        annotations[index] = {
            width: label.width, height: label.height, offset: (object instanceof Node) ? ({
                x: label.offset.x,
                y: label.offset.y
            }) : label.offset,
            rotateAngle: label.rotateAngle,
            margin: { left: label.margin.left, right: label.margin.right, top: label.margin.top, bottom: label.margin.bottom },
            horizontalAlignment: label.horizontalAlignment, verticalAlignment: label.verticalAlignment,
            alignment: ((object instanceof Connector) ? label.alignment : undefined)
        };
        return { annotations: annotations };
    };
    /** @private */
    CommandHandler.prototype.getPortChanges = function (object, port) {
        var index = findObjectIndex(object, port.id, false);
        var ports = {};
        ports[index] = { offset: port.offset };
        return { ports: ports };
    };
    /** @private */
    CommandHandler.prototype.labelRotate = function (object, label, currentPosition, selector) {
        var oldValues;
        var changedvalues;
        oldValues = this.getAnnotationChanges(object, label);
        var matrix = identityMatrix();
        var rotateAngle = label.rotateAngle;
        var labelWrapper = this.diagram.getWrapper(object.wrapper, label.id);
        var angle = findAngle({ x: labelWrapper.offsetX, y: labelWrapper.offsetY }, currentPosition) + 90;
        var snapAngle = this.snapAngle(angle);
        angle = snapAngle !== 0 ? snapAngle : angle;
        if (label instanceof PathAnnotation && label.segmentAngle) {
            var getPointloop = getAnnotationPosition(object.intermediatePoints, label, object.wrapper.bounds);
            angle -= getPointloop.angle;
        }
        angle = (angle + 360) % 360;
        label.rotateAngle += angle - (label.rotateAngle + labelWrapper.parentTransform);
        if (label instanceof PathAnnotation) {
            label.alignment = 'Center';
            label.horizontalAlignment = label.verticalAlignment = 'Center';
        }
        else {
            label.horizontalAlignment = label.verticalAlignment = 'Center';
        }
        selector.wrapper.rotateAngle = selector.rotateAngle = label.rotateAngle;
        changedvalues = this.getAnnotationChanges(object, label);
        if (object instanceof Node) {
            this.diagram.nodePropertyChange(object, oldValues, changedvalues);
        }
        else {
            this.diagram.connectorPropertyChange(object, oldValues, changedvalues);
        }
        this.diagram.updateDiagramObject(object);
    };
    /** @private */
    CommandHandler.prototype.labelResize = function (node, label, deltaWidth, deltaHeight, pivot, selector) {
        var oldValues;
        var changedvalues;
        var rotateAngle;
        oldValues = this.getAnnotationChanges(node, label);
        var textElement = selector.wrapper.children[0];
        if ((deltaWidth && deltaWidth !== 1) || (deltaHeight && deltaHeight !== 1)) {
            var newMat = identityMatrix();
            var matrix = identityMatrix();
            rotateMatrix(newMat, -node.rotateAngle, node.offsetX, node.offsetY);
            rotateAngle = ((textElement.rotateAngle + ((node instanceof Node) ? node.rotateAngle : 0)) + 360) % 360;
            rotateMatrix(matrix, -rotateAngle, pivot.x, pivot.y);
            scaleMatrix(matrix, deltaWidth, deltaHeight, pivot.x, pivot.y);
            rotateMatrix(matrix, rotateAngle, pivot.x, pivot.y);
            var height = textElement.actualSize.height * deltaHeight;
            var width = textElement.actualSize.width * deltaWidth;
            var shape = this.findTarget(textElement, node);
            var newPosition = transformPointByMatrix(matrix, { x: textElement.offsetX, y: textElement.offsetY });
            if (shape instanceof PathAnnotation) {
                switch (label.verticalAlignment) {
                    case "Center":
                        if (label.horizontalAlignment == 'Center') {
                            newPosition = transformPointByMatrix(matrix, { x: textElement.offsetX, y: textElement.offsetY });
                        }
                        else if (label.horizontalAlignment == 'Right') {
                            newPosition = transformPointByMatrix(matrix, { x: textElement.offsetX + (textElement.outerBounds.width) / 2, y: textElement.offsetY });
                        }
                        else if (label.horizontalAlignment == 'Left') {
                            newPosition = transformPointByMatrix(matrix, { x: textElement.offsetX - (textElement.outerBounds.width) / 2, y: textElement.offsetY });
                        }
                        break;
                    case "Top":
                        if (label.horizontalAlignment == 'Center') {
                            newPosition = transformPointByMatrix(matrix, { x: textElement.offsetX, y: textElement.offsetY - (textElement.outerBounds.height) / 2 });
                        }
                        else if (label.horizontalAlignment == 'Right') {
                            newPosition = transformPointByMatrix(matrix, { x: textElement.offsetX + (textElement.outerBounds.width) / 2, y: textElement.offsetY - (textElement.outerBounds.height) / 2 });
                        }
                        else if (label.horizontalAlignment == 'Left') {
                            newPosition = transformPointByMatrix(matrix, { x: textElement.offsetX - (textElement.outerBounds.width) / 2, y: textElement.offsetY - (textElement.outerBounds.height) / 2 });
                        }
                        break;
                    case "Bottom":
                        if (label.horizontalAlignment == 'Center') {
                            newPosition = transformPointByMatrix(matrix, { x: textElement.offsetX, y: textElement.offsetY + (textElement.outerBounds.height) / 2 });
                        }
                        else if (label.horizontalAlignment == 'Right') {
                            newPosition = transformPointByMatrix(matrix, { x: textElement.offsetX + (textElement.outerBounds.width) / 2, y: textElement.offsetY + (textElement.outerBounds.height) / 2 });
                        }
                        else if (label.horizontalAlignment == 'Left') {
                            newPosition = transformPointByMatrix(matrix, { x: textElement.offsetX - (textElement.outerBounds.width) / 2, y: textElement.offsetY + (textElement.outerBounds.height) / 2 });
                        }
                        break;
                }
            }
            if (shape instanceof PathAnnotation) {
                this.updatePathAnnotationOffset(node, label, 0, 0, newPosition, new Size(width, height));
            }
            else {
                var bounds = cornersPointsBeforeRotation(node.wrapper);
                newPosition = transformPointByMatrix(newMat, newPosition);
                newPosition.x = newPosition.x - textElement.margin.left + textElement.margin.right;
                newPosition.y = newPosition.y - textElement.margin.top + textElement.margin.bottom;
                newPosition.y += (shape.verticalAlignment === 'Top') ? (-height / 2) : ((shape.verticalAlignment === 'Bottom') ? (height / 2) : 0);
                newPosition.x += (shape.horizontalAlignment === 'Left') ? (-width / 2) : ((shape.horizontalAlignment === 'Right') ? (width / 2) : 0);
                var offsetx = bounds.width / (newPosition.x - bounds.x);
                var offsety = bounds.height / (newPosition.y - bounds.y);
                if (width > 1) {
                    shape.width = width;
                    shape.offset.x = 1 / offsetx;
                }
                if (height > 1) {
                    shape.height = height;
                    shape.offset.y = 1 / offsety;
                }
            }
        }
        if (label instanceof PathAnnotation) {
            label.alignment = 'Center';
        }
        changedvalues = this.getAnnotationChanges(node, label);
        if (node instanceof Node) {
            this.diagram.nodePropertyChange(node, oldValues, changedvalues);
        }
        else {
            this.diagram.connectorPropertyChange(node, oldValues, changedvalues);
        }
        this.diagram.updateDiagramObject(node);
    };
    /** @private */
    CommandHandler.prototype.getSubProcess = function (source) {
        var selector = { nodes: [], connectors: [] };
        var process;
        if (source instanceof Node) {
            process = source.processId;
        }
        else if (source && source.nodes && (source.nodes.length)
            && source.nodes[0].processId) {
            process = source.nodes[0].processId;
        }
        if (process) {
            selector.nodes.push(clone(this.diagram.nameTable[process]));
            return selector;
        }
        return selector;
    };
    /**   @private  */
    CommandHandler.prototype.checkBoundaryConstraints = function (tx, ty, nodeBounds) {
        var pageSettings = this.diagram.pageSettings;
        var boundaryConstraints = this.diagram.pageSettings.boundaryConstraints;
        var scroller = this.diagram.scroller;
        if (boundaryConstraints === 'Page' || boundaryConstraints === 'Diagram') {
            var selectorBounds = !nodeBounds ? this.diagram.selectedItems.wrapper.bounds : undefined;
            var width = boundaryConstraints === 'Page' ? pageSettings.width : scroller.viewPortWidth;
            var height = boundaryConstraints === 'Page' ? pageSettings.height : scroller.viewPortHeight;
            var bounds = nodeBounds;
            var right = (nodeBounds ? bounds.right : selectorBounds.right) + (tx || 0);
            var left = (nodeBounds ? bounds.left : selectorBounds.left) + (tx || 0);
            var top_2 = (nodeBounds ? bounds.top : selectorBounds.top) + (ty || 0);
            var bottom = (nodeBounds ? bounds.bottom : selectorBounds.bottom) + (ty || 0);
            if (right <= width && left >= 0
                && bottom <= height && top_2 >= 0) {
                return true;
            }
            return false;
        }
        return true;
    };
    //interfaces
    /** @private */
    CommandHandler.prototype.dragSelectedObjects = function (tx, ty) {
        var obj = this.diagram.selectedItems;
        if (this.state && !this.state.backup) {
            this.state.backup = {};
            this.state.backup.offsetX = obj.offsetX;
            this.state.backup.offsetY = obj.offsetY;
        }
        obj = renderContainerHelper(this.diagram, obj) || obj;
        if (this.checkBoundaryConstraints(tx, ty)) {
            this.diagram.diagramActions = this.diagram.diagramActions | (DiagramAction.PreventZIndexOnDragging | DiagramAction.DragUsingMouse);
            var actualObject = this.diagram.selectedObject.actualObject;
            if ((actualObject && actualObject instanceof Node && actualObject.isLane &&
                canLaneInterchange(actualObject, this.diagram)) || (!actualObject || !actualObject.isLane)) {
                this.diagram.drag(obj, tx, ty);
            }
            this.diagram.diagramActions = this.diagram.diagramActions & ~(DiagramAction.PreventZIndexOnDragging | DiagramAction.DragUsingMouse);
            this.diagram.refreshCanvasLayers();
            return true;
        }
        return false;
    };
    /** @private */
    CommandHandler.prototype.scaleSelectedItems = function (sx, sy, pivot) {
        var obj = this.diagram.selectedItems;
        if (this.state && !this.state.backup) {
            this.state.backup = {};
            this.state.backup.offsetX = obj.offsetX;
            this.state.backup.offsetY = obj.offsetY;
            this.state.backup.width = obj.width;
            this.state.backup.height = obj.height;
            this.state.backup.pivot = pivot;
        }
        obj = renderContainerHelper(this.diagram, obj) || obj;
        return this.diagram.scale(obj, sx, sy, pivot);
    };
    /** @private */
    CommandHandler.prototype.rotateSelectedItems = function (angle) {
        var obj = this.diagram.selectedItems;
        if (this.state && !this.state.backup) {
            this.state.backup = {};
            this.state.backup.angle = obj.rotateAngle;
        }
        obj = renderContainerHelper(this.diagram, obj) || obj;
        return this.diagram.rotate(obj, angle);
    };
    /** @private */
    CommandHandler.prototype.hasSelection = function () {
        return hasSelection(this.diagram);
    };
    /** @private */
    CommandHandler.prototype.isSelected = function (element) {
        return isSelected(this.diagram, element);
    };
    /**
     * initExpand is used for layout expand and collapse interaction
     */
    CommandHandler.prototype.initExpand = function (args) {
        var propName = 'isProtectedOnChange';
        var protectedChange = this.diagram[propName];
        this.diagram.protectPropertyChange(true);
        var node = (args.target || args.source);
        var oldValues = { isExpanded: node.isExpanded };
        node.isExpanded = !node.isExpanded;
        this.diagram.preventNodesUpdate = true;
        this.diagram.diagramActions |= DiagramAction.PreventIconsUpdate;
        this.diagram.nodePropertyChange(node, oldValues, { isExpanded: node.isExpanded });
        this.diagram.diagramActions = this.diagram.diagramActions & ~DiagramAction.PreventIconsUpdate;
        this.diagram.preventNodesUpdate = false;
        for (var _i = 0, _a = this.diagram.views; _i < _a.length; _i++) {
            var temp = _a[_i];
            var view = this.diagram.views[temp];
            if (!(view instanceof Diagram)) {
                this.diagram.refreshCanvasDiagramLayer(view);
            }
        }
        this.diagram.protectPropertyChange(protectedChange);
    };
    /** @private */
    CommandHandler.prototype.expandNode = function (node, diagram, canLayout) {
        var animation;
        //let objects: ILayout;
        var preventNodesUpdate = this.diagram.preventNodesUpdate;
        var expand = node.isExpanded;
        this.diagram.preventNodesUpdate = true;
        this.diagram.preventConnectorsUpdate = true;
        this.expandCollapse(node, expand, this.diagram);
        node.isExpanded = expand;
        var fixedNode = this.diagram.layout.fixedNode;
        this.diagram.layout.fixedNode = node.id;
        if ((this.diagram.diagramActions != DiagramAction.Render) && this.diagram.layoutAnimateModule && this.diagram.layout.enableAnimation && this.diagram.organizationalChartModule) {
            this.diagram.organizationalChartModule.isAnimation = true;
        }
        this.diagram.blazorActions |= BlazorAction.expandNode;
        var objects = {};
        if (!canLayout) {
            // BLAZ-22230 - Added below code to check if its blazor means then we set canUpdateTemplate as true
            if (isBlazor()) {
                this.canUpdateTemplate = true;
            }
            objects = this.diagram.doLayout();
        }
        this.canUpdateTemplate = false;
        this.diagram.blazorActions &= ~BlazorAction.expandNode;
        this.diagram.preventNodesUpdate = preventNodesUpdate;
        this.diagram.preventConnectorsUpdate = false;
        if (this.diagram.layoutAnimateModule && this.diagram.organizationalChartModule && !canLayout) {
            this.diagram.allowServerDataBinding = false;
            this.layoutAnimateModule.expand(this.diagram.layout.enableAnimation, objects, node, this.diagram);
        }
        else {
            var arg = {
                element: cloneBlazorObject(clone(node)), state: (node.isExpanded) ? true : false
            };
            this.triggerEvent(DiagramEvent.expandStateChange, arg);
            if (this.diagram.lineRoutingModule && this.diagram.constraints & DiagramConstraints.LineRouting) {
                this.diagram.resetSegments();
            }
        }
        this.diagram.layout.fixedNode = fixedNode === '' ? '' : this.diagram.layout.fixedNode;
        return objects;
    };
    CommandHandler.prototype.getparentexpand = function (target, diagram, visibility, connector) {
        var boolean;
        for (var i = 0; i < target.inEdges.length; i++) {
            var newConnector = diagram.nameTable[target.inEdges[i]];
            var previousNode = diagram.nameTable[newConnector.sourceID];
            if (previousNode.isExpanded && !visibility && previousNode.id !== connector.sourceID && newConnector.visible) {
                return false;
            }
            else {
                boolean = true;
            }
        }
        return boolean;
    };
    /**
     * Setinterval and Clear interval for layout animation
     */
    /** @private */
    CommandHandler.prototype.expandCollapse = function (source, visibility, diagram) {
        for (var i = 0; i < source.outEdges.length; i++) {
            var connector = diagram.nameTable[source.outEdges[i]];
            var target = diagram.nameTable[connector.targetID];
            var value = this.getparentexpand(target, diagram, visibility, connector);
            connector.visible = visibility;
            var oldValues = {
                visible: target.visible,
                style: { opacity: target.wrapper.style.opacity }
            };
            var newValues = {
                visible: target.visible,
                style: { opacity: target.wrapper.style.opacity }
            };
            if (value) {
                if (target.isExpanded) {
                    this.expandCollapse(target, visibility, diagram);
                }
                target.visible = visibility;
                target.style.opacity = (this.diagram.layoutAnimateModule &&
                    this.diagram.layout.enableAnimation && visibility) ? 0.1 : target.style.opacity;
                diagram.nodePropertyChange(target, oldValues, newValues);
            }
            diagram.connectorPropertyChange(connector, oldValues, newValues);
        }
    };
    /**
     * @private
     */
    CommandHandler.prototype.updateNodeDimension = function (obj, rect) {
        if (obj instanceof Node) {
            obj.offsetX = rect.x + rect.width / 2;
            obj.offsetY = rect.y + rect.height / 2;
            obj.width = rect.width;
            obj.height = rect.height;
            obj.wrapper.children[0].canMeasurePath = true;
            this.diagram.nodePropertyChange(obj, {}, {
                width: rect.width, height: rect.height, offsetX: obj.offsetX,
                offsetY: obj.offsetY
            });
            if (this.diagram.mode !== 'SVG') {
                this.diagram.refreshDiagramLayer();
            }
        }
    };
    /**
     * @private
     */
    CommandHandler.prototype.updateConnectorPoints = function (obj, rect) {
        if (obj instanceof Connector) {
            this.diagram.connectorPropertyChange(obj, {}, {
                targetPoint: obj.targetPoint
            });
            this.diagram.updateDiagramObject(obj);
        }
    };
    /**
     * @private
     */
    CommandHandler.prototype.updateSelectedNodeProperties = function (object) {
        if (this.diagram.lineRoutingModule && (this.diagram.constraints & DiagramConstraints.LineRouting)) {
            var previousNodeObject = [];
            var previousConnectorObject = [];
            var updateNodeObject = [];
            var updateConnectorObject = [];
            var changeNodes = [];
            var changeConnectors = [];
            this.diagram.protectPropertyChange(true);
            var objects = [];
            var connectors = [];
            var actualObject = this.diagram.selectedObject.actualObject;
            var helperObject = this.diagram.selectedObject.helperObject;
            if (helperObject && actualObject) {
                var offsetX = (helperObject.offsetX - actualObject.offsetX);
                var offsetY = (helperObject.offsetY - actualObject.offsetY);
                var width = (helperObject.width - actualObject.width);
                var height = (helperObject.height - actualObject.height);
                var rotateAngle = (helperObject.rotateAngle - actualObject.rotateAngle);
                if (this.diagram.selectedItems.nodes.length + this.diagram.selectedItems.connectors.length > 0) {
                    this.diagram.selectedItems.wrapper.rotateAngle = this.diagram.selectedItems.rotateAngle = helperObject.rotateAngle;
                }
                if (actualObject instanceof Node &&
                    actualObject.shape.type !== 'SwimLane' && !actualObject.isLane && !actualObject.isPhase && !actualObject.isHeader) {
                    if (actualObject.offsetX !== actualObject.wrapper.offsetX || actualObject.offsetY !== actualObject.wrapper.offsetY ||
                        actualObject.width !== actualObject.wrapper.width || actualObject.height !== actualObject.wrapper.height ||
                        actualObject.rotateAngle !== actualObject.wrapper.rotateAngle) {
                        if (isBlazor()) {
                            previousNodeObject.push(cloneObject(actualObject, undefined, undefined, true));
                        }
                        actualObject.offsetX += offsetX;
                        actualObject.offsetY += offsetY;
                        actualObject.width += width;
                        actualObject.height += height;
                        actualObject.rotateAngle += rotateAngle;
                        this.diagram.nodePropertyChange(actualObject, {}, {
                            offsetX: actualObject.offsetX, offsetY: actualObject.offsetY,
                            width: actualObject.width, height: actualObject.height, rotateAngle: actualObject.rotateAngle
                        });
                        if (isBlazor()) {
                            updateNodeObject.push(cloneObject(actualObject, undefined, undefined, true));
                        }
                    }
                    objects = this.diagram.spatialSearch.findObjects(actualObject.wrapper.outerBounds);
                }
                else if (actualObject instanceof Selector) {
                    for (var i = 0; i < actualObject.nodes.length; i++) {
                        var node = actualObject.nodes[i];
                        if (node instanceof Node && node.shape.type !== 'SwimLane' && !node.isLane
                            && !node.isPhase && !node.isHeader) {
                            node.offsetX += offsetX;
                            node.offsetY += offsetY;
                            node.width += width;
                            node.height += height;
                            node.rotateAngle += rotateAngle;
                            this.diagram.nodePropertyChange(node, {}, {
                                offsetX: node.offsetX, offsetY: node.offsetY,
                                width: node.width, height: node.height, rotateAngle: node.rotateAngle
                            });
                            objects = objects.concat(this.diagram.spatialSearch.findObjects(actualObject.wrapper.outerBounds));
                        }
                    }
                }
            }
            else {
                if (object instanceof Connector) {
                    objects.push(object);
                }
                else if (object instanceof Selector && object.connectors.length) {
                    objects = objects.concat(object.connectors);
                }
            }
            for (var i = 0; i < objects.length; i++) {
                if (objects[i] instanceof Connector && connectors.indexOf(objects[i].id) === -1) {
                    connectors.push(objects[i].id);
                }
            }
            this.diagram.lineRoutingModule.renderVirtualRegion(this.diagram, true);
            for (var i = 0; i < connectors.length; i++) {
                var connector = this.diagram.nameTable[connectors[i]];
                if (connector instanceof Connector && connector.type === 'Orthogonal') {
                    if (isBlazor()) {
                        previousConnectorObject.push(cloneObject(connector, undefined, undefined, true));
                    }
                    this.diagram.lineRoutingModule.refreshConnectorSegments(this.diagram, connector, true);
                    if (isBlazor()) {
                        updateConnectorObject.push(cloneObject(connector, undefined, undefined, true));
                    }
                }
            }
            this.updateSelector();
            if (isBlazor()) {
                this.getObjectChanges(previousNodeObject, updateNodeObject, changeNodes);
                this.getObjectChanges(previousConnectorObject, updateConnectorObject, changeConnectors);
                var blazorInterop = 'sfBlazor';
                var blazor = 'Blazor';
                var diagramObject = { nodes: changeNodes, connectors: changeConnectors };
                if (window && window[blazor] && (changeConnectors.length + changeNodes.length)) {
                    var obj = { 'methodName': 'UpdateBlazorProperties', 'diagramobj': diagramObject };
                    window[blazorInterop].updateBlazorProperties(obj, this.diagram);
                }
            }
            this.diagram.protectPropertyChange(false);
        }
    };
    /** @private */
    CommandHandler.prototype.drawSelectionRectangle = function (x, y, width, height) {
        this.diagram.drawSelectionRectangle(x, y, width, height);
    };
    /** @private */
    CommandHandler.prototype.startGroupAction = function () {
        this.diagram.startGroupAction();
    };
    /** @private */
    CommandHandler.prototype.endGroupAction = function () {
        this.diagram.endGroupAction();
    };
    /** @private */
    CommandHandler.prototype.removeChildFromBPmn = function (child, newTarget, oldTarget) {
        var obj = this.diagram.nameTable[child.id] || child.nodes[0];
        if (oldTarget) {
            if ((obj) && obj.processId && obj.processId === oldTarget.wrapper.id) {
                var node = clone(obj);
                node.processId = obj.processId;
                this.diagram.startGroupAction();
                var edges = [];
                edges = edges.concat(obj.outEdges, obj.inEdges);
                for (var i = edges.length - 1; i >= 0; i--) {
                    var connector = this.diagram.nameTable[edges[i]];
                    if (connector) {
                        this.diagram.remove(connector);
                    }
                }
                //let nodeCollection: string[];
                var nodeCollection = (this.diagram.nameTable[obj.processId].shape.activity.subProcess.processes) || [];
                nodeCollection.splice(nodeCollection.indexOf((obj).id), 1);
                this.diagram.bpmnModule.removeChildFromBPMN(this.diagram.nameTable[obj.processId].wrapper, (obj).id);
                this.diagram.nameTable[(obj).id].processId = '';
                obj.offsetX = obj.wrapper.offsetX;
                obj.offsetY = obj.wrapper.offsetY;
                var undoElement = clone(obj);
                var entry = {
                    type: 'PositionChanged', redoObject: { nodes: [undoElement] }, undoObject: { nodes: [node] }, category: 'Internal'
                };
                this.addHistoryEntry(entry);
                this.diagram.endGroupAction();
            }
        }
    };
    /** @private */
    CommandHandler.prototype.isDroppable = function (source, targetNodes) {
        var node = this.diagram.nameTable[source.id] || source.nodes[0];
        if (node) {
            if ((!isBlazor() && node.shape.shape === 'TextAnnotation') ||
                (isBlazor() && node.shape.bpmnShape === 'TextAnnotation')) {
                return true;
            }
            if (node && node.shape.type === 'Bpmn') {
                if ((node.processId === targetNodes.id) || (node.id === targetNodes.processId) ||
                    targetNodes.shape.type === 'Bpmn'
                        && targetNodes.shape.activity.subProcess.collapsed) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    /**
     * @private
     */
    CommandHandler.prototype.renderHighlighter = function (args, connectHighlighter, source) {
        var bounds = new Rect();
        if (args.target instanceof Node || (connectHighlighter && args.source instanceof Node)) {
            var tgt = connectHighlighter ? args.source : args.target;
            var tgtWrap = connectHighlighter ? args.sourceWrapper : args.targetWrapper;
            var target = this.findTarget(tgtWrap, tgt, source, true);
            var element = void 0;
            if (target instanceof BpmnSubEvent) {
                var portId = target.id;
                var node = args.target;
                var parent_8 = node.wrapper.children[0].children[0].children[2];
                for (var _i = 0, _a = parent_8.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    if (child.id === node.id + '_' + portId) {
                        element = child.children[0];
                        break;
                    }
                }
            }
            else {
                element = target instanceof Node ?
                    target.wrapper : connectHighlighter ? args.sourceWrapper : args.targetWrapper;
            }
            this.diagram.renderHighlighter(element);
        }
    };
    //additional events
    /** @private */
    CommandHandler.prototype.mouseOver = function (source, target, position) {
        //mouse over
        //returns whether the source can move over the target or not
        return true;
    };
    /**
     * @private
     */
    CommandHandler.prototype.snapPoint = function (startPoint, endPoint, tx, ty) {
        var obj = this.diagram.selectedItems;
        var point;
        var towardsLeft = endPoint.x < startPoint.x;
        var towardsTop = endPoint.y < startPoint.y;
        point = { x: tx, y: ty };
        var snappedPoint = point;
        if (this.snappingModule) {
            snappedPoint = this.diagram.snappingModule.snapPoint(this.diagram, obj, towardsLeft, towardsTop, point, startPoint, endPoint);
        }
        return snappedPoint;
    };
    /**
     * @private
     */
    CommandHandler.prototype.removeSnap = function () {
        if ((this.diagram.snapSettings.constraints & SnapConstraints.SnapToObject) && this.snappingModule) {
            this.snappingModule.removeGuidelines(this.diagram);
        }
    };
    /** @private */
    CommandHandler.prototype.dropAnnotation = function (source, target) {
        var node = (source instanceof Node) ? source : source.nodes[0];
        if (this.diagram.bpmnModule && target.shape.type === 'Bpmn'
            && ((!isBlazor() && node.shape.shape === 'TextAnnotation') ||
                (isBlazor() && node.shape.bpmnShape === 'TextAnnotation'))) {
            var hasTarget = 'hasTarget';
            node[hasTarget] = target.id;
            node.shape.annotation.nodeId = target.id;
            if (!this.diagram.currentSymbol) {
                this.diagram.addTextAnnotation(node.shape.annotation, target);
                node.shape.annotation.nodeId = '';
                this.diagram.remove(node);
            }
            this.diagram.refreshDiagramLayer();
        }
    };
    /** @private */
    CommandHandler.prototype.drop = function (source, target, position) {
        //drop
        if (this.diagram.bpmnModule) {
            var sourcenode = (source instanceof Node) ? source : source.nodes[0];
            if (sourcenode && sourcenode.shape.type === 'Bpmn' && target.shape.type === 'Bpmn') {
                this.diagram.bpmnModule.dropBPMNchild(target, (source instanceof Node) ? source : source.nodes[0], this.diagram);
                this.diagram.refreshDiagramLayer();
            }
        }
    };
    /** @private */
    CommandHandler.prototype.addHistoryEntry = function (entry) {
        this.diagram.addHistoryEntry(entry);
    };
    /** @private */
    CommandHandler.prototype.align = function (objects, option, type) {
        if (objects.length > 0) {
            var i = 0;
            objects[0] = this.diagram.nameTable[objects[0].id] || objects[0];
            var bounds = (type === 'Object') ? getBounds(objects[0].wrapper) : this.diagram.selectedItems.wrapper.bounds;
            var undoObj = { nodes: [], connectors: [] };
            var redoObj = { nodes: [], connectors: [] };
            for (i = ((type === 'Object') ? (i + 1) : i); i < objects.length; i++) {
                var tx = 0;
                var ty = 0;
                objects[i] = this.diagram.nameTable[objects[i].id] || objects[i];
                var objectBounds = getBounds(objects[i].wrapper);
                if (option === 'Left') {
                    tx = bounds.left + objectBounds.width / 2 - objectBounds.center.x;
                }
                else if (option === 'Right') {
                    tx = bounds.right - objectBounds.width / 2 - objectBounds.center.x;
                }
                else if (option === 'Top') {
                    ty = bounds.top + objectBounds.height / 2 - objectBounds.center.y;
                }
                else if (option === 'Bottom') {
                    ty = bounds.bottom - objectBounds.height / 2 - objectBounds.center.y;
                }
                else if (option === 'Center') {
                    tx = bounds.center.x - objectBounds.center.x;
                }
                else if (option === 'Middle') {
                    ty = bounds.center.y - objectBounds.center.y;
                }
                undoObj = this.storeObject(undoObj, objects[i]);
                this.drag(objects[i], tx, ty);
                this.diagram.updateSelector();
                redoObj = this.storeObject(redoObj, objects[i]);
            }
            undoObj = clone(undoObj);
            redoObj = clone(redoObj);
            var entry = {
                type: 'Align', category: 'Internal',
                undoObject: cloneObject(undoObj), redoObject: cloneObject(redoObj)
            };
            this.addHistoryEntry(entry);
        }
    };
    /**
     * distribute method \
     *
     * @returns { void }     distribute method .\
     * @param {(NodeModel | ConnectorModel)[]} objects - provide the source value.
     * @param {SizingOptions} option - provide the target value.
     *
     * @private
     */
    CommandHandler.prototype.distribute = function (objects, option) {
        if (objects.length > 0) {
            var i = 0;
            //const j: number = 0;
            //const rect: Rect = new Rect();
            //const b: Rect[] = [];
            //let temp: NodeModel | ConnectorModel;
            var right = 0;
            var left = 0;
            var top_3 = 0;
            var bottom = 0;
            var center = 0;
            var middle = 0;
            var btt = 0;
            //const sum: number = 0;
            var undoSelectorObj = { nodes: [], connectors: [] };
            var redoSelectorObj = { nodes: [], connectors: [] };
            for (i = 0; i < objects.length; i++) {
                objects[i] = this.diagram.nameTable[objects[i].id] || objects[i];
            }
            objects = sort(objects, option);
            for (i = 1; i < objects.length; i++) {
                right = right + objects[i].wrapper.bounds.topRight.x - objects[i - 1].wrapper.bounds.topRight.x;
                left = left + objects[i].wrapper.bounds.topLeft.x - objects[i - 1].wrapper.bounds.topLeft.x;
                top_3 = top_3 + objects[i].wrapper.bounds.topRight.y - objects[i - 1].wrapper.bounds.topRight.y;
                bottom = bottom + objects[i].wrapper.bounds.bottomRight.y - objects[i - 1].wrapper.bounds.bottomRight.y;
                center = center + objects[i].wrapper.bounds.center.x - objects[i - 1].wrapper.bounds.center.x;
                middle = middle + objects[i].wrapper.bounds.center.y - objects[i - 1].wrapper.bounds.center.y;
                btt = btt + objects[i].wrapper.bounds.topRight.y - objects[i - 1].wrapper.bounds.bottomRight.y;
            }
            for (i = 1; i < objects.length - 1; i++) {
                var tx = 0;
                var ty = 0;
                var prev = getBounds(objects[i - 1].wrapper);
                var current = getBounds(objects[i].wrapper);
                if (option === 'RightToLeft' || option === 'Center') {
                    tx = prev.center.x - current.center.x + (center / (objects.length - 1));
                }
                else if (option === 'Right') {
                    tx = prev.topRight.x - current.topRight.x + (right / (objects.length - 1));
                }
                else if (option === 'Left') {
                    tx = prev.topLeft.x - current.topLeft.x + (left / (objects.length - 1));
                }
                else if (option === 'Middle') {
                    ty = prev.center.y - current.center.y + (middle / (objects.length - 1));
                }
                else if (option === 'Top') {
                    ty = prev.topRight.y - current.topRight.y + (top_3 / (objects.length - 1));
                }
                else if (option === 'Bottom') {
                    ty = prev.bottomRight.y - current.bottomRight.y + (bottom / (objects.length - 1));
                }
                else if (option === 'BottomToTop') {
                    ty = prev.bottomRight.y - current.topRight.y + (btt / (objects.length - 1));
                }
                undoSelectorObj = this.storeObject(undoSelectorObj, objects[i]);
                this.drag(objects[i], tx, ty);
                this.diagram.updateSelector();
                redoSelectorObj = this.storeObject(redoSelectorObj, objects[i]);
            }
            undoSelectorObj = clone(undoSelectorObj);
            redoSelectorObj = clone(redoSelectorObj);
            var entry = {
                type: 'Distribute', category: 'Internal',
                undoObject: cloneObject(undoSelectorObj), redoObject: cloneObject(redoSelectorObj)
            };
            this.addHistoryEntry(entry);
        }
    };
    /* eslint-enable */
    /**
     * sameSize method \
     *
     * @returns { void }     sameSize method .\
     * @param {(NodeModel | ConnectorModel)[]} objects - provide the source value.
     * @param {SizingOptions} option - provide the target value.
     *
     * @private
     */
    CommandHandler.prototype.sameSize = function (objects, option) {
        if (objects.length > 0) {
            var i = 0;
            //let pivot: PointModel;
            var pivot = { x: 0.5, y: 0.5 };
            objects[0] = this.diagram.nameTable[objects[0].id] || objects[0];
            var bounds = getBounds(objects[0].wrapper);
            var undoObject = { nodes: [], connectors: [] };
            var redoObject = { nodes: [], connectors: [] };
            for (i = 1; i < objects.length; i++) {
                objects[i] = this.diagram.nameTable[objects[i].id] || objects[0];
                var rect = getBounds(objects[i].wrapper);
                var sw = 1;
                var sh = 1;
                if (option === 'Width') {
                    sw = bounds.width / rect.width;
                }
                else if (option === 'Height') {
                    sh = bounds.height / rect.height;
                }
                else if (option === 'Size') {
                    sw = bounds.width / rect.width;
                    sh = bounds.height / rect.height;
                }
                undoObject = this.storeObject(undoObject, objects[i]);
                this.scale(objects[i], sw, sh, pivot);
                redoObject = this.storeObject(redoObject, objects[i]);
            }
            this.diagram.updateSelector();
            undoObject = clone(undoObject);
            redoObject = clone(redoObject);
            var entry = {
                type: 'Sizing', category: 'Internal',
                undoObject: cloneObject(undoObject), redoObject: cloneObject(redoObject)
            };
            this.addHistoryEntry(entry);
        }
    };
    CommandHandler.prototype.storeObject = function (selectorObject, obj) {
        if (obj instanceof Node) {
            selectorObject.nodes.push(clone(obj));
        }
        else {
            selectorObject.connectors.push(clone(obj));
        }
        return selectorObject;
    };
    /**
     * updatePanState method \
     *
     * @returns { any }     updatePanState method .\
     * @param {number} eventCheck - provide the eventCheck value.
     *
     * @private
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CommandHandler.prototype.updatePanState = function (eventCheck) {
        if (eventCheck) {
            this.diagram.realActions = this.diagram.realActions | RealAction.PanInProgress;
        }
        else {
            this.diagram.dataBind();
            var diagramScrollSettings = this.diagram.scrollSettings;
            this.diagram.realActions = this.diagram.realActions & ~RealAction.PanInProgress;
            var Values = {
                VerticalOffset: diagramScrollSettings.verticalOffset, HorizontalOffset: diagramScrollSettings.horizontalOffset,
                ViewportHeight: diagramScrollSettings.viewPortHeight, ViewportWidth: diagramScrollSettings.viewPortWidth,
                CurrentZoom: diagramScrollSettings.currentZoom
            };
            var arg = {
                oldValue: Values,
                newValue: Values, source: this.diagram, panState: 'Completed'
            };
            this.triggerEvent(DiagramEvent.scrollChange, arg);
        }
    };
    /**
     * dataBinding method \
     *
     * @returns { void }     dataBinding method .\
     *
     * @private
     */
    CommandHandler.prototype.dataBinding = function () {
        this.diagram.dataBind();
    };
    CommandHandler.prototype.setBlazorDiagramProps = function (arg) {
        this.diagram.setBlazorDiagramProps(arg);
    };
    /**
     * scroll method \
     *
     * @returns { void }     scroll method .\
     * @param {number} scrollX - provide the source value.
     * @param {number} scrollY - provide the target value.
     * @param {PointModel} focusPoint - provide the layoutOrientation value.
     *
     * @private
     */
    CommandHandler.prototype.scroll = function (scrollX, scrollY, focusPoint) {
        var panx = canPanX(this.diagram);
        var pany = canPanY(this.diagram);
        if (isBlazor()) {
            this.diagram.setCursor('grabbing');
            this.diagram.scroller.zoom(1, (scrollX = panx ? scrollX : 0) * this.diagram.scroller.currentZoom, (scrollY = pany ? scrollY : 0) * this.diagram.scroller.currentZoom, focusPoint);
        }
        else {
            this.diagram.pan((scrollX = panx ? scrollX : 0) * this.diagram.scroller.currentZoom, (scrollY = pany ? scrollY : 0) * this.diagram.scroller.currentZoom, focusPoint);
        }
    };
    /**
     * drawHighlighter method \
     *
     * @returns { NodeModel | ConnectorModel }     drawHighlighter method .\
     * @param {IElement} element - provide the element value.
     *
     * @private
     */
    CommandHandler.prototype.drawHighlighter = function (element) {
        this.diagram.renderHighlighter(element.wrapper);
    };
    /**
     * removeHighlighter method \
     *
     * @returns { void }     removeHighlighter method .\
     *
     * @private
     */
    CommandHandler.prototype.removeHighlighter = function () {
        this.diagram.clearHighlighter();
    };
    /**
     * renderContainerHelper method \
     *
     * @returns { NodeModel | ConnectorModel }     renderContainerHelper method .\
     * @param {NodeModel | SelectorModel | ConnectorModel} node - provide the parent value.
     *
     * @private
     */
    CommandHandler.prototype.renderContainerHelper = function (node) {
        return renderContainerHelper(this.diagram, node);
    };
    /**
     * isParentAsContainer method \
     *
     * @returns { boolean }     isParentAsContainer method .\
     * @param {NodeModel} node - provide the parent value.
     * @param {boolean} isChild - provide the target value.
     *
     * @private
     */
    CommandHandler.prototype.isParentAsContainer = function (node, isChild) {
        return checkParentAsContainer(this.diagram, node, isChild);
    };
    /**
     * dropChildToContainer method \
     *
     * @returns { void }     dropChildToContainer method .\
     * @param {NodeModel} parent - provide the parent value.
     * @param {NodeModel} node - provide the target value.
     *
     * @private
     */
    CommandHandler.prototype.dropChildToContainer = function (parent, node) {
        if (!(this.diagram.diagramActions & DiagramAction.PreventLaneContainerUpdate)) {
            addChildToContainer(this.diagram, parent, node);
        }
    };
    /**
    *
    * @private
    */
    CommandHandler.prototype.updateLaneChildrenZindex = function (node, target) {
        var lowerIndexobject = this.findLeastIndexObject(node, target);
        var swimlane = this.diagram.nameTable[target.parentId];
        if (swimlane && swimlane.zIndex > lowerIndexobject.zIndex) {
            var layerIndex = this.diagram.layers.indexOf(this.diagram.getActiveLayer());
            var layerZIndexTable = this.diagram.layers[layerIndex].zIndexTable;
            var tempTable = JSON.parse(JSON.stringify(layerZIndexTable));
            var startIndex = lowerIndexobject.zIndex;
            var endIndex = swimlane.zIndex;
            for (var i = endIndex; i >= startIndex; i--) {
                if (startIndex !== i) {
                    if (!layerZIndexTable[i - 1]) {
                        layerZIndexTable[i - 1] = layerZIndexTable[i];
                        this.diagram.nameTable[layerZIndexTable[i - 1]].zIndex = i;
                        delete layerZIndexTable[i];
                    }
                    else {
                        //bringing the objects forward
                        layerZIndexTable[i] = layerZIndexTable[i - 1];
                        this.diagram.nameTable[layerZIndexTable[i]].zIndex = i;
                    }
                }
                else {
                    var tempIndex = this.swapZIndexObjects(endIndex, layerZIndexTable, swimlane.id, tempTable);
                }
            }
            if (this.diagram.mode === 'SVG') {
                this.moveSvgNode(target.parentId, lowerIndexobject.id);
                this.updateNativeNodeIndex(target.parentId, lowerIndexobject.id);
            }
            else {
                this.diagram.refreshCanvasLayers();
            }
        }
    };
    CommandHandler.prototype.findLeastIndexConnector = function (edges, target, index) {
        for (var i = 0; i < edges.length; i++) {
            var connector = this.diagram.nameTable[edges[i]];
            if (index.zIndex > connector.zIndex) {
                index = connector;
            }
        }
        return index;
    };
    CommandHandler.prototype.findLeastIndexObject = function (node, target) {
        var lowerIndexobject = node;
        if (node instanceof Node) {
            lowerIndexobject = this.findLeastIndexConnector(node.inEdges, target, lowerIndexobject);
            lowerIndexobject = this.findLeastIndexConnector(node.outEdges, target, lowerIndexobject);
        }
        return lowerIndexobject;
    };
    /**
     * checkSelection method \
     *
     * @returns { void }     checkSelection method .\
     * @param {SelectorModel} selector - provide the source value.
     * @param {string} corner - provide the target value.
     *
     * @private
     */
    CommandHandler.prototype.checkSelection = function (selector, corner) {
        var node; // let wrapper: GridPanel; let child: Container; let index: number; let shape: SwimLaneModel;
        if (selector.nodes.length === 1 && selector.connectors.length === 0) {
            if (checkParentAsContainer(this.diagram, selector.nodes[0], true)) {
                node = (selector.nodes[0].shape === 'SwimLane') ? selector.nodes[0] :
                    this.diagram.nameTable[selector.nodes[0].parentId];
                var child = selector.nodes[0];
                if (node.shape.type === 'SwimLane') {
                    var orientation_1 = (node.shape.orientation === 'Horizontal') ? true : false;
                    if ((child.isPhase && ((orientation_1 && corner === 'ResizeSouth') || (!orientation_1 && corner === 'ResizeEast'))) ||
                        (child.isLane && ((orientation_1 && corner === 'ResizeEast') || (!orientation_1 && corner === 'ResizeSouth')))) {
                        swimLaneSelection(this.diagram, node, corner);
                    }
                }
                else if (node.container.type === 'Grid') {
                    if (((node.container.orientation === 'Horizontal' && child.rowIndex === 1) ||
                        (node.container.orientation === 'Vertical' && child.rowIndex > 0 && child.columnIndex > 0))) {
                        if (corner === 'ResizeSouth') {
                            for (var i = 0; i < this.diagram.nodes.length; i++) {
                                var obj = this.diagram.nodes[i];
                                if (obj.rowIndex === node.rows.length - 1 && obj.columnIndex === 0) {
                                    this.select(obj);
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        if (corner === 'ResizeEast') {
                            for (var i = 0; i < this.diagram.nodes.length; i++) {
                                var obj = this.diagram.nodes[i];
                                if (obj.rowIndex === 1 && obj.columnIndex === node.columns.length - 1) {
                                    this.select(obj);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            else {
                swimLaneSelection(this.diagram, selector.nodes[0], corner);
            }
        }
    };
    /**
     * zoom method \
     *
     * @returns { void }     zoom method .\
     * @param {number} scale - provide the source value.
     * @param {number} scrollX - provide the target value.
     * @param {number} scrollY - provide the layoutOrientation value.
     * @param {PointModel} focusPoint - provide the layoutOrientation value.
     *
     * @private
     */
    CommandHandler.prototype.zoom = function (scale, scrollX, scrollY, focusPoint) {
        this.diagram.scroller.zoom(scale, scrollX * this.diagram.scroller.currentZoom, scrollY * this.diagram.scroller.currentZoom, focusPoint);
    };
    return CommandHandler;
}());
export { CommandHandler };
