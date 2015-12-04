Data this tool will work with
-----------------------------

# Node (aka "cell") Types
## VALUE
#### Ways to view, edit: text, classic visual encodings
Contains a primitive data value (bool, float, int, string, null).

## LINK
#### Ways to view, edit: text @definition, line (with various routing, arrow options), categorical encodings
Contains an explicit reference to another cell anywhere in the dataset; this may be local (relative to itself) or global (relative to the root cell).

## FORMULA / SCRIPT
#### Ways to view, edit: text =definition, lines (with various routing, arrow options), categorical encodings
Derives any other cell type, dependent on the state of zero or more other cells anywhere in the dataset.

## LIST
#### Ways to view, edit: text [definition], text $definition, various layout / rendering options
Contains multiple, ordered cells.

# Special Cell Types
#### These are technically just lists and/or links, but they may have special rules that constrain how they behave (that make them useful for data wrangling and/or algorithm efficiency)

## SET
A list that only contains distinct cells.

## EDGE
In general, an edge describes a relationship between two cells. However, it can be represented in many ways. Low-level mechanisms vary in terms of how much specification there is in the data vs in an algorithm or the user's head.

### Explicit link
In this case, a link points into another data structure. The link @definition contains all the necessary information to uniquely identify both the target data structure, as well as the location within it. No user understanding is necessary to identify the target of the link.

### Potential link
This is similar to an explicit link in that all the necessary information to locate the target exists, but some sort of structural understanding (in an algorithm or in the user's head) needs to be employed to combine values to create an explicit link. For example, the first value in a list could contain the name of a target dict, and the second value could contain the key. Or the first three coordinates in a list could correspond to the dimensions of a volume.

### Addresses or coordinates
An address or coordinate is similar to a potential link, except the target data structure is also implicit (that specification exists in some algorithm or in the user's head). The structure that the coordinates refer to must be specified in order to resolve an address or list of coordinates into a potential link.

### Shared categorical variables
An edge (or hyperedge) can also be implied by a shared categorical value between elements.

### Shared structure

### Value-based, Implicit
In this case, a common categorical value implies a (potentially many-way or hyperedge) relationship between nodes that contain the same value.

### Structural, Explicit

### Structural, Implicit










If the edges are not implicit, they can take two forms:
### FORM 1
A list of exactly length 2. The first element is the key, the second is the value.
### FORM 2
One or more key cells connected to the value cell by links.

Note that all forms support composite keys; we allow the first element in form 1 to be anything (list, dict, etc). Form 2 allows multiple cells pointing to the target; in this case, the set of source cells are a composite key.

## INDEX
A set of cells that are all Form 2 keys (their links point outside the index).

## DICT
A list of tuples, where each tuple has the same form, and the key in every tuple is distinct.

## TABLE
A dict where each key is a composite of at least 2 cells (either a list of coordinates for tuple forms 1 and 3, or column/row headers form 2).

## MATRIX / VOLUME / HYPERVOLUME
A table where the key coordinates/headers are integers >= 0. A matrix has keys with two members, a volume has three, and a hypervolume has more than three.

# Edge considerations
## LINK vs KEY vs STRUCTURE

## DUALITY

## INTERMEDIATE

## DIRECTION: EXPLICIT vs IMPLICIT




-------------------------
## FORWARD_LINK
Source owns link, points to target

## DUAL_LINK
Source and Target have link values that point to each other

## FORWARD_ATTRIBUTE_BASED_LINK
Source has a categorical attribute that implicitly corresponds to the Target cell (used in adjacency matrices and node-link lists)

## DUAL_ATTRIBUTE_BASED_LINK
Same idea as FORWARD_ATTRIBUTE_BASED_LINK, except the Target and Source both have categorical attributes that implicitly refer to each other

## DOUBLE_FORWARD_LINK
Source owns one link, Intermediate owns the next

## DOUBLE_ORDER_BASED_LINK
Intermediate must own both links (Source and/or Target may or may not have dual ownership); direction is implicit in the ordering of the links in the Intermediate cell

## DOUBLE_ATTRIBUTE_BASED_LINK
Intermediate has an attribute indicating direction; ownership can be any combination of Source, Target, and Intermediate



## Insert / Create Cell
#### arguments: location in the data structure
Create an empty cell in the specified location

## Delete Cell
#### arguments: cell
Remove the cell and all its contents

## Create Link
#### arguments: cell or location in the data structure, edge type


## Create

## Destroy

## Split

## Collapse

## Add directionality

## Remove directionality

## Reverse direction

## Nest / Roll up
#### target: link value A OR linked cell B
Given a link value A that points to cell B, replace the cell containing A with all of the contents of B

## Unroll / De-nest
#### target: cell A AND target location for new cell B (default: new sibling of A's parent)
Given a cell A, move all its contents to a new external cell B. Replace the contents of A with a link pointing to B