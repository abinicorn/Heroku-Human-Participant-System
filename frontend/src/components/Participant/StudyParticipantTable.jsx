import React, {useState, useEffect, useContext} from 'react';
import {Chip, Typography, Box, Button, Menu, MenuItem } from '@mui/material';
import {styled} from '@mui/material/styles'
import { DataGrid, GridToolbar, GRID_CHECKBOX_SELECTION_COL_DEF, gridPageCountSelector,
GridPagination, useGridApiContext, useGridSelector } from '@mui/x-data-grid';
import MuiPagination from '@mui/material/Pagination';

import EditParticipant from './EditParticipant';
import CloseCircleButton from '../Button/CloseCircleButton';
import OptionPopup from '../Popup/OptionPopup';
import OptionDialog from '../Popup/OptonDialog';

import { combineCodeSerialNum } from '../../utils/combineCodeSerialNum';
import { StudyParticipantContext } from '../../providers/StudyPaticipantsProvider';
import { StudyResearcherContext } from '../../providers/StudyResearcherContextProvider';
import { DataGridContext } from '../../providers/DataGridProvider';

import { CustomPagination } from '../../styles/CustomPagination';
import { CustomNoRowsOverlay } from '../../styles/CustomNoRowsOverlay';
import { StyledDataGrid } from '../../styles/StyledDataGrid';

import '../../styles/DataGrid.css';


export default function ParticipantsTable() {
    console.log("Start to render datagrid");

    const {studyParticipants, finalUpdateStudyParticipant, toggleStudyParticipantsProperty, 
          toggleParticipantsProperty, isAnonymous, selectedRows, setSelectedRows, 
          setStudyParticipantNotActive} = useContext(StudyParticipantContext);
    
    const {
      sortModel, setSortModel,
      filterModel, setFilterModel,
      pageModel, setPageModel,
      columnVisibility, setColumnVisibility
    } = useContext(DataGridContext);  

    const {studyInfo} = useContext(StudyResearcherContext);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const gridStyle = studyParticipants.length === 0
    ? { height: 400, width: '100%' }
    : { height: '87vh', width: '100%' };

    const handleUpdateParticipant = async (updatedParticipant) => {
      const response = await finalUpdateStudyParticipant(updatedParticipant);
      console.log(response);

    };

    const handleDelete = async (studyParticipant) => {
        const response = await setStudyParticipantNotActive(studyParticipant)
        console.log(response);
    };
    
    const [selectedProperty, setSelectedProperty] = useState("");

    const handlePropertyChange = (event) => {
      setSelectedProperty(event.target.value);
    };

    // multiple update boolean value
    const handleToggleSelectedRows = () => {
      const updatedParticipants = studyParticipants.filter(participant => selectedRows.includes(participant._id))
      .map(participant => {
        if (selectedProperty) {
          if (selectedProperty === "isWillContact") {
            return {
              ...participant,
              participantInfo: {
                ...participant.participantInfo,
                isWillContact: !participant.participantInfo.isWillContact,
              },
            };
          } else {
            return {
              ...participant,
              [selectedProperty]: !participant[selectedProperty],
            };
          }
        }
        return participant;
      });

      const dataToSend = assembleData(updatedParticipants, selectedProperty);
      console.log(dataToSend);

      updateToggleStudyParticipants(dataToSend, selectedProperty)
    };

    function assembleData(participants, property) {
      if (property  === "isWillContact") {
        const ids = participants.map(participant => participant.participantInfo._id);
        return {
          ids: ids,
          propertyName: property
        };

      } else {
        const ids = participants.map(participant => participant._id);
        return {
          ids: ids,
          propertyName: property
        };
      }
    }

    async function updateToggleStudyParticipants(participants, property) {
      if (property  === "isWillContact") {
        await toggleParticipantsProperty(participants)
      } else {
        await toggleStudyParticipantsProperty(participants);
      }
    }

    const handleDeleteSelectedRows = () => {
      const dataToSend = {
          ids: selectedRows,
          propertyName: "isActive"
      };
  
      deleteSelectedStudyParticipants(dataToSend);
  };
  
  async function deleteSelectedStudyParticipants(data) {
      try {
          await toggleStudyParticipantsProperty(data);
      } catch (error) {
          console.error("Error deleting selected participants:", error);
      }
  }

    let baseColumns = [
      { 
        field: 'serialNum', 
        headerName: 'Serial No.', 
        flex: 1.5,
        headerAlign: 'center',
        align: 'center',
        valueGetter: (params) => params.row.serialNum,
        valueFormatter: (params) => {
            if (studyInfo && studyInfo.studyCode) {
                return combineCodeSerialNum(studyInfo.studyCode, params.value);
            }
            return params.value;
        }
      }
    ];

    if (!isAnonymous) {
      baseColumns = [
          ...baseColumns,
          { 
            field: 'name', 
            headerName: 'Name', 
            flex: 1.5,
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params) => `${params.row.participantInfo.firstName} ${params.row.participantInfo.lastName}`
          }
      ];
    };

    baseColumns = [
      ...baseColumns,
      { 
        field: 'email', 
        headerName: 'Email', 
        flex: 3, 
        headerAlign: 'center',
        align: 'center',
        valueGetter: (params) => params.row.participantInfo.email,
        renderCell: (params) => (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                overflow: 'hidden',
                flexWrap: 'wrap',
                wordBreak: 'break-all'
            }}>
                <a href={`mailto:${params.value}`} style={{ padding: '8px' }}>
                {params.value}
                </a>
            </div>
        )
      }
    ];

    if (!isAnonymous) {
      baseColumns = [
          ...baseColumns,
          { 
            field: 'phoneNum', 
            headerName: 'Phone\nNumber', 
            flex: 1.5,
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params) => `${params.row.participantInfo.phoneNum}`
          }
      ];
    };
    
    const columns = [
        ...baseColumns,
        { 
            field: 'isComplete', 
            headerName: 'Status', 
            flex: 1.5, 
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params) => params.row.isComplete ? 'Completed' : 'Processing', 
            renderCell: (params) => params.row.isComplete ? 
                <Chip label="Completed" color="success"/> : 
                <Chip label="Processing" color="success" variant="outlined" /> 
        },
        { 
            field: 'isGift', 
            headerName: 'Gift', 
            flex: 1, 
            headerAlign: 'center', 
            align: 'center',
            valueGetter: (params) => params.row.isGift ? 'Yes' : 'No', 
            renderCell: (params) => {
                return params.row.isGift ? 
                    <Typography variant="body1" style={{ color: 'green', fontWeight: 'bold' }}>Yes</Typography> : 
                    <Typography variant="body1" style={{ color: 'red', fontWeight: 'bold' }}>No</Typography>;
            }
        },
        { 
            field: 'isWIllReceiveReport', 
            headerName: 'Report\nRequested', 
            flex: 1.5, 
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params) => params.row.isWIllReceiveReport ? 'Yes' : 'No',
            renderCell: (params) => {
                return params.row.isWIllReceiveReport ? 
                    <Typography variant="body1" style={{ color: 'green', fontWeight: 'bold' }}>Yes</Typography> : 
                    <Typography variant="body1" style={{ color: 'red', fontWeight: 'bold' }}>No</Typography>;
            }
        },
        { 
            field: 'isWillContact', 
            headerName: 'Future\nContact', 
            flex: 1, 
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params) => params.row.participantInfo.isWillContact ? 'Yes' : 'No',
            renderCell: (params) => {
                return params.row.participantInfo.isWillContact ? 
                    <Typography variant="body1" style={{ color: 'green', fontWeight: 'bold' }}>Yes</Typography> : 
                    <Typography variant="body1" style={{ color: 'red', fontWeight: 'bold' }}>No</Typography>;
            }
        },
        { 
            field: 'tags', 
            headerName: 'Tags', 
            flex: 2, 
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params) => {
                const sortedTags = [...params.row.participantInfo.tagsInfo].sort();
                return sortedTags.join(', ');
            },
            renderCell: (params) => {
              // 从value中分割tags
              const tags = params.value ? params.value.split(', ').filter(tag => tag) : [];
              return (
                  <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      flexWrap: 'wrap'
                  }}>
                      {tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" style={{ margin: '0 2px' }} />
                      ))}
                  </div>
              );
            }
        },
        {
            field: 'note',
            headerName: 'Note',
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params) => params.row.note,
            flex: 3,
            wrapText: true
        },
        {
            field: 'edit', 
            headerName: 'Edit', 
            flex: 1, 
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <EditParticipant 
                    participant={params.row} 
                    onSave={(updatedParticipant) => {
                        handleUpdateParticipant(updatedParticipant);
                    }}
                    isAnonymous={isAnonymous}
                />
            )
        },
        {
            field: 'delete',
            headerName: 'Delete',
            flex: 1, 
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <CloseCircleButton 
                    popupText={'Are you sure you want to delete this participant?'}
                    onClick={() => handleDelete(params.row)} 
                    size='25px'/>
            )
        }
    ];

    return (
        <div style={gridStyle}>
            <Box mb={1} display='flex' justifyContent='space-between' height="35px">
                {selectedRows.length > 0 && 
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-end'}}>
                      <select value={selectedProperty} onChange={handlePropertyChange}>
                        <option value="">Select a property</option>
                        <option value="isComplete">Status</option>
                        <option value="isGift">Gift</option>
                        <option value="isWIllReceiveReport">Report Requested</option>
                        <option value="isWillContact">Future Contact</option>
                      </select>
                      <button onClick={handleToggleSelectedRows}>Toggle Selected Rows</button>
                    </div>
                    <Button 
                      variant="outlined"
                      color='error'
                      size='small'
                      onClick={() => setDeleteDialogOpen(true)}>
                        Delete Selected Participants
                    </Button>
                    <OptionDialog 
                      open={deleteDialogOpen} 
                      onClose={() => setDeleteDialogOpen(false)}
                      popupText="This action will delete the selected StudyParticipants. Are you sure you want to proceed?"
                      onClick={() => {
                          handleDeleteSelectedRows();
                          setDeleteDialogOpen(false);
                      }}
                    />
                  </>
                }
            </Box>

            <StyledDataGrid
                sx={{
                    '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': { py: '8px' },
                    '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': { py: '15px' },
                    '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': { py: '22px' },
                }} 
                // autoHeight
                rows={studyParticipants}
                // rows={Array.isArray(studyParticipants) ? studyParticipants : []}
                columns={columns}
                // columnVisibilityModel={{
                //     // Hide column note at the beginning, the other columns will remain visible
                //     hidden: ['note']
                // }}
                getRowHeight={() => 'auto'}
                getRowId={(row) => row._id}
                paginationModel={pageModel}
                columnVisibilityModel={columnVisibility}
                initialState={{
                    columns: {
                        columnVisibilityModel: {
                          // Hide columns status and traderName, the other columns will remain visible
                          note: false,
                          delete: false
                        },
                      },
                    pagination: { 
                        paginationModel:  
                        { pageSize: 100 } 
                    },
                }}
                onRowSelectionModelChange={(newRowSelectionModel) => {
                  console.log('newSelection', newRowSelectionModel);
                  setSelectedRows(newRowSelectionModel);
                }}
                rowSelectionModel={selectedRows}
                pagination
                slots={{
                    pagination: CustomPagination,
                    noRowsOverlay: CustomNoRowsOverlay,
                    toolbar: GridToolbar
                }}
                pageSizeOptions={[25, 50, 100, 200, 500, 1000, 2000, 5000]}
                checkboxSelection={true}

                onSortModelChange={(newModel) => {
                  setSortModel(newModel);
                }}
                sortModel={sortModel}
                onFilterModelChange={(newModel) => {
                    setFilterModel(newModel);
                }}
                filterModel={filterModel}

                onPaginationModelChange={(newModel) => {
                  setPageModel(newModel);
                }}
                onColumnVisibilityModelChange={(newModel) => {
                    setColumnVisibility(newModel);
                }}
                // autoPageSize             
                disableRowSelectionOnClick
                // hideFooterSelectedRowCount
            />
        </div>
    );
}