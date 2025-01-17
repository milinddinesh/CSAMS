import { useBatchQuery, useCurriculumExtraCoursesQuery, useAddBatchExtraCourseMutation, useUpdateBatchExtraCourseMutation, useDeleteBatchExtraCourseMutation, ExtraCourseType } from '@/graphql/generated/graphql';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MutableRefObject, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';


interface BatchUpdateSettingsProps {
    batchID: string
}

const BatchUpdateSettings = ({batchID}:BatchUpdateSettingsProps) => {
    const [result] = useBatchQuery({variables:{BATCHID:batchID},requestPolicy:'network-only'})
    const {fetching, data, error} = result;
    const toast = useRef(null);

    if (error) return <div>Failed to fetch batch details: {error.message}</div>;
    if (fetching) return <div>Loading</div>
    return (
        <div className="card">
            <Toast ref={toast}/>
            <h5>{data?.batch?.curriculum?.program} {data?.batch?.year} Batch</h5>
            <div className="grid p-fluid mt-5">
                <div className="field col-12 md:col-6">
                    <span className="">
                    <h6>Curriculum</h6>
                    <InputText
                        type="text"
                        value={data?.batch?.curriculum?.program + " " + data?.batch?.curriculum?.year}
                        disabled
                    ></InputText>
                    </span>
                </div>
                <div className="field col-12 md:col-6">
                    <span className="">
                    <h6>Semester</h6>
                    <InputText
                        type="number"
                        value={data?.batch?.sem.toString()}
                        disabled
                    ></InputText>
                    </span>
                </div>
            </div>
            <ExtraCourseMappingTable
                toast={toast} 
                batchID={batchID}
                curriculumYear={data?.batch?.curriculum?.year} 
                extras={data?.batch?.semesterExtraCourses} 
                program={data?.batch?.curriculum?.program}
            />
                
        </div>
    );
}

interface ExtraCourseMappingTableProps {
    extras: Array<string>,
    program: string,
    curriculumYear: number,
    batchID: string,
    toast: any,
}

interface ExtraCourseTableData {
    id: number,
    type: string,
    selectedCourseID: string | null,
    selectedCourseCodeName: string | null,
    extraCourses: Array<ExtraCourseType>,
    isVerified: boolean,

}

interface ModeType {
    type: null | 'delete' | 'update' | 'create'
}

interface Label {
    label?: String
}

type ExtraCourseCustomType = ExtraCourseType & Label;

const ExtraCourseMappingTable = ({extras, program, curriculumYear, batchID, toast}:ExtraCourseMappingTableProps) => {
    let filteredExtras = extras.filter(function(item, pos) {
        return extras.indexOf(item) == pos;
    })
    let _initialMode: ModeType = {
        type: null
    }

    let parsedData: Array<ExtraCourseTableData> = [];
    const [tableData, setTableData] = useState(parsedData);
    const [currentID, setCurrentID] = useState(-1);


    const [dialogShown, setDialogShown] = useState(true);
    const [mode, setMode] = useState(_initialMode);

    const [addBatchExtraCourse, addBatchExtraCourseMutation] = useAddBatchExtraCourseMutation();
    const [updateBatchExtraCourse, updateBatchExtraCourseMutation] = useUpdateBatchExtraCourseMutation();
    const [deleteBatchExtraCourse, deleteBatchExtraCourseMutation] = useDeleteBatchExtraCourseMutation();

    const [result] = useCurriculumExtraCoursesQuery({variables:{CURRICULUMYEAR: curriculumYear, EXTRAS: filteredExtras, PROGRAM: program, BATCHID: batchID}});
    const {fetching, data, error} = result;

    if (error?.message) {
        return <div>Failed to fetch extra courses: {error.message}</div>
    }
    if (fetching) {
        return <div>Loading</div>
    }

    if (!dialogShown) {
        if (addBatchExtraCourse.error?.message) {
            toast.current.show({ severity: 'error', summary: 'Error assigning Extra course', detail: addBatchExtraCourse.error.message, life: 3000 });
            setDialogShown(true);
        }
        if (updateBatchExtraCourse.error?.message) {
            toast.current.show({ severity: 'error', summary: 'Error updating Extra course', detail: updateBatchExtraCourse.error.message, life: 3000 });
            setDialogShown(true);
        }
        
        if (deleteBatchExtraCourse.error?.message) {
            toast.current.show({ severity: 'error', summary: 'Error deleting Extra course', detail: deleteBatchExtraCourse.error.message, life: 3000 });
            setDialogShown(true);
        }
        if (mode.type === 'create' && addBatchExtraCourse.data?.addBatchExtraCourse) {
            toast.current.show({ severity: 'success', summary: 'Extra Course assigned', life: 3000 });
            if (currentID>=0) {
                let row = tableData.filter(td=>td.id===currentID);
                if (row.length === 1) {
                    let _tableData = [...tableData];
                    let c = addBatchExtraCourse.data.addBatchExtraCourse.response?.extraCourse;
                    _tableData[tableData.indexOf(row[0])] = {...row[0], selectedCourseCodeName: c?.code + ' ' + c?.name, selectedCourseID: c?.id?.toString(), isVerified: c?.id !== null || c?.id !== undefined};
                    setTableData(_tableData);
                    setCurrentID(-1);
                }
                
            }
            setDialogShown(true);
            setMode({type: null});
        }
        if (mode.type === 'update' && updateBatchExtraCourse.data?.updateBatchExtraCourse) {

            toast.current.show({ severity: 'success', summary: 'Extra Course updated', life: 3000 });
            if (currentID>=0) {
                let row = tableData.filter(td=>td.id===currentID);
                if (row.length === 1) {
                    let _tableData = [...tableData];
                    let oec = updateBatchExtraCourse.data.updateBatchExtraCourse.response?.oldExtraCourse;
                    let nec = updateBatchExtraCourse.data.updateBatchExtraCourse.response?.newExtraCourse;
                    _tableData[tableData.indexOf(row[0])] = {...row[0], selectedCourseCodeName: nec?.code + ' ' + nec?.name, selectedCourseID: nec?.id?.toString(), isVerified: nec?.id !== null || nec?.id !== undefined,};
                    setTableData(_tableData);
                    setCurrentID(-1);
                }
                
            }
            setDialogShown(true);
            setMode({type: null});
        }
        if (mode.type === 'delete' && deleteBatchExtraCourse.data?.deleteBatchExtraCourse) {
            toast.current.show({ severity: 'success', summary: 'Extra Course deleted', life: 3000 });
            if (currentID>=0) {
                let row = tableData.filter(td=>td.id===currentID);
                console.log("deleted", row);
                if (row.length === 1) {
                    let _tableData = [...tableData];
                    _tableData[tableData.indexOf(row[0])] = {...row[0], selectedCourseCodeName: "", selectedCourseID: null, isVerified: false};
                    setTableData(_tableData);
                    setCurrentID(-1);
                }
                
            }
            
            setDialogShown(true);
            setMode({type: null});
        }
    }

    const onExtraCourseChange = async (x: ExtraCourseCustomType, ec: ExtraCourseTableData) => {
        setDialogShown(false);

        if (x.label === 'None') {
            setCurrentID(ec.id);
            setMode({type: 'delete'});
            await deleteBatchExtraCourseMutation({BATCHID: batchID, OLD_EXTRA_COURSEID: ec.selectedCourseID})
        }
        else if (ec.selectedCourseID){
            setCurrentID(ec.id);
            setMode({type: 'update'});
            await updateBatchExtraCourseMutation({BATCHID:batchID, OLD_EXTRA_COURSEID:ec.selectedCourseID, NEW_EXTRA_COURSEID: x.id });
        } else {
            setCurrentID(ec.id);
            setMode({type: 'create'});
            await addBatchExtraCourseMutation({BATCHID: batchID, EXTRA_COURSEID: x.id});
        }
    }
    const actionBodyTemplate = (rowData: ExtraCourseTableData) => {
        let options;
        if (rowData?.selectedCourseID) options = [{label: 'None'}].concat(rowData.extraCourses.map((c => {return {...c, 'label': c?.code + ' ' + c?.name}})))
        else options = rowData.extraCourses.map((c => {return {...c, 'label': c?.code + ' ' + c?.name}}))
        return (
            <Dropdown value={null} onChange={(e) => onExtraCourseChange(e.value, rowData)} options={options} optionLabel="label" placeholder={rowData?.selectedCourseID ? "Update Course" : "Select Course"} filter />
        );
    };

    const isVerifiedTemplate = (rowData: ExtraCourseTableData) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.isVerified, 'text-pink-500 pi-times-circle': !rowData.isVerified })}></i>;
    };
    if (tableData.length === 0) {
        let id = 0;
        for (let type of extras) {
            let selectedCourseID = null;
            let selectedCourseCodeName = null;
            let extraCourses: Array<ExtraCourseType> = [];
    
            for (let courseObject of data?.curriculumExtraCourses) {
                if (courseObject?.extra === type && courseObject.courses) {
                    extraCourses = courseObject.courses;
                    break;
                }
            }
    
            parsedData.push({
                id: id++,
                type: type,
                selectedCourseID: selectedCourseID,
                selectedCourseCodeName: selectedCourseCodeName,
                extraCourses: extraCourses,
                isVerified: false,
            });
        }
        setTableData(parsedData);
    }
    

    data?.batchSelectedExtraCourses?.forEach((d) => {
        let foo = parsedData.filter((p)=> p.selectedCourseID === null && p.type === d?.courseType);
        if (foo.length > 0) {
            foo[0].selectedCourseID = d?.id || null;
            foo[0].selectedCourseCodeName = d?.code + " " + d?.name;
            foo[0].isVerified = d?.id !== null;
        }
    })
    return (
        <div>
            <DataTable
                value={tableData}
                dataKey="id"
                rows={10}
                loading={fetching}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} extra courses"
                emptyMessage="No Extra courses info found."
                responsiveLayout="scroll"
            >
                <Column field="type" header="Extra" filterMenuStyle={{ width: '16rem' }} style={{ minWidth: '2rem' }} />
                <Column field="selectedCourseCodeName" header="Selected" filterMenuStyle={{ width: '16rem' }} style={{ minWidth: '2rem' }} />
                <Column body={actionBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                <Column field="isVerified" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '6rem' }} body={isVerifiedTemplate} /> 
            </DataTable>
        </div>
    )
}

export default BatchUpdateSettings;