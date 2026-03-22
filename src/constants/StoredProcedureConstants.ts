import z from "zod";

const StoredProcedureConstantsSchema = z.object({
  USP_CREATE_ASSET: z.literal("usp_CreateAsset"),
  USP_CREATE_ASSETFIX: z.literal("usp_CreateAssetFix"),
  USP_CREATE_ASSETISSUE: z.literal("usp_CreateAssetIssue"),
  USP_CREATE_AUTHENTICATION: z.literal("usp_CreateAuthentication"),
  USP_CREATE_BUILDING: z.literal("usp_CreateBuilding"),
  USP_CREATE_CATEGORY: z.literal("usp_CreateCategory"),
  USP_CREATE_COMPANY: z.literal("usp_CreateCompany"),
  USP_CREATE_DEPARTMENT: z.literal("usp_CreateDepartment"),
  USP_CREATE_EMPLOYEE: z.literal("usp_CreateEmployee"),
  USP_CREATE_ENDUSER: z.literal("usp_CreateEndUser"),
  USP_CREATE_ENDUSERROLE: z.literal("usp_CreateEndUserRole"),
  USP_CREATE_LOCATION: z.literal("usp_CreateLocation"),
  USP_CREATE_LOG: z.literal("usp_CreateLog"),
  USP_CREATE_MANUFACTURER: z.literal("usp_CreateManufacturer"),
  USP_CREATE_PRODUCT: z.literal("usp_CreateProduct"),
  USP_CREATE_PRODUCTSET: z.literal("usp_CreateProductSet"),
  USP_CREATE_ROLE: z.literal("usp_CreateRole"),
  USP_CREATE_VENDOR: z.literal("usp_CreateVendor"),
  USP_DELETE_ASSET: z.literal("usp_DeleteAsset"),
  USP_DELETE_ASSETFIX: z.literal("usp_DeleteAssetFix"),
  USP_DELETE_ASSETISSUE: z.literal("usp_DeleteAssetIssue"),
  USP_DELETE_BUILDING: z.literal("usp_DeleteBuilding"),
  USP_DELETE_CATEGORY: z.literal("usp_DeleteCategory"),
  USP_DELETE_COMPANY: z.literal("usp_DeleteCompany"),
  USP_DELETE_DEPARTMENT: z.literal("usp_DeleteDepartment"),
  USP_DELETE_EMPLOYEE: z.literal("usp_DeleteEmployee"),
  USP_DELETE_ENDUSER: z.literal("usp_DeleteEndUser"),
  USP_DELETE_ENDUSERROLE: z.literal("usp_DeleteEndUserRole"),
  USP_DELETE_LOCATION: z.literal("usp_DeleteLocation"),
  USP_DELETE_LOG: z.literal("usp_DeleteLog"),
  USP_DELETE_MANUFACTURER: z.literal("usp_DeleteManufacturer"),
  USP_DELETE_PRODUCT: z.literal("usp_DeleteProduct"),
  USP_DELETE_PRODUCTSET: z.literal("usp_DeleteProductSet"),
  USP_DELETE_ROLE: z.literal("usp_DeleteRole"),
  USP_DELETE_VENDOR: z.literal("usp_DeleteVendor"),
  USP_READ_ASSET: z.literal("usp_ReadAsset"),
  USP_READ_ASSETFIX: z.literal("usp_ReadAssetFix"),
  USP_READ_ASSETISSUE: z.literal("usp_ReadAssetIssue"),
  USP_READ_BUILDING: z.literal("usp_ReadBuilding"),
  USP_READ_CATEGORY: z.literal("usp_ReadCategory"),
  USP_READ_COMPANY: z.literal("usp_ReadCompany"),
  USP_READ_DEPARTMENT: z.literal("usp_ReadDepartment"),
  USP_READ_EMPLOYEE: z.literal("usp_ReadEmployee"),
  USP_READ_ENDUSER: z.literal("usp_ReadEndUser"),
  USP_READ_ENDUSERROLE: z.literal("usp_ReadEndUserRole"),
  USP_READ_LOCATION: z.literal("usp_ReadLocation"),
  USP_READ_LOG: z.literal("usp_ReadLog"),
  USP_READ_MANUFACTURER: z.literal("usp_ReadManufacturer"),
  USP_READ_PRODUCT: z.literal("usp_ReadProduct"),
  USP_READ_PRODUCTSET: z.literal("usp_ReadProductSet"),
  USP_READ_ROLE: z.literal("usp_ReadRole"),
  USP_READ_VENDOR: z.literal("usp_ReadVendor"),
  USP_UPDATE_ASSET: z.literal("usp_UpdateAsset"),
  USP_UPDATE_ASSETFIX: z.literal("usp_UpdateAssetFix"),
  USP_UPDATE_ASSETISSUE: z.literal("usp_UpdateAssetIssue"),
  USP_UPDATE_BUILDING: z.literal("usp_UpdateBuilding"),
  USP_UPDATE_CATEGORY: z.literal("usp_UpdateCategory"),
  USP_UPDATE_COMPANY: z.literal("usp_UpdateCompany"),
  USP_UPDATE_DEPARTMENT: z.literal("usp_UpdateDepartment"),
  USP_UPDATE_EMPLOYEE: z.literal("usp_UpdateEmployee"),
  USP_UPDATE_ENDUSER: z.literal("usp_UpdateEndUser"),
  USP_UPDATE_ENDUSERROLE: z.literal("usp_UpdateEndUserRole"),
  USP_UPDATE_LOCATION: z.literal("usp_UpdateLocation"),
  USP_UPDATE_MANUFACTURER: z.literal("usp_UpdateManufacturer"),
  USP_UPDATE_PRODUCT: z.literal("usp_UpdateProduct"),
  USP_UPDATE_PRODUCTSET: z.literal("usp_UpdateProductSet"),
  USP_UPDATE_ROLE: z.literal("usp_UpdateRole"),
  USP_UPDATE_VENDOR: z.literal("usp_UpdateVendor"),
});

type StoredProcedureConstants = z.infer<typeof StoredProcedureConstantsSchema>;

export const storedProcedureConstants: StoredProcedureConstants = {
  USP_CREATE_ASSET: StoredProcedureConstantsSchema.shape.USP_CREATE_ASSET.value,
  USP_CREATE_ASSETFIX:
    StoredProcedureConstantsSchema.shape.USP_CREATE_ASSETFIX.value,
  USP_CREATE_ASSETISSUE:
    StoredProcedureConstantsSchema.shape.USP_CREATE_ASSETISSUE.value,
  USP_CREATE_AUTHENTICATION:
    StoredProcedureConstantsSchema.shape.USP_CREATE_AUTHENTICATION.value,
  USP_CREATE_BUILDING:
    StoredProcedureConstantsSchema.shape.USP_CREATE_BUILDING.value,
  USP_CREATE_CATEGORY:
    StoredProcedureConstantsSchema.shape.USP_CREATE_CATEGORY.value,
  USP_CREATE_COMPANY:
    StoredProcedureConstantsSchema.shape.USP_CREATE_COMPANY.value,
  USP_CREATE_DEPARTMENT:
    StoredProcedureConstantsSchema.shape.USP_CREATE_DEPARTMENT.value,
  USP_CREATE_EMPLOYEE:
    StoredProcedureConstantsSchema.shape.USP_CREATE_EMPLOYEE.value,
  USP_CREATE_ENDUSER:
    StoredProcedureConstantsSchema.shape.USP_CREATE_ENDUSER.value,
  USP_CREATE_ENDUSERROLE:
    StoredProcedureConstantsSchema.shape.USP_CREATE_ENDUSERROLE.value,
  USP_CREATE_LOCATION:
    StoredProcedureConstantsSchema.shape.USP_CREATE_LOCATION.value,
  USP_CREATE_LOG: StoredProcedureConstantsSchema.shape.USP_CREATE_LOG.value,
  USP_CREATE_MANUFACTURER:
    StoredProcedureConstantsSchema.shape.USP_CREATE_MANUFACTURER.value,
  USP_CREATE_PRODUCT:
    StoredProcedureConstantsSchema.shape.USP_CREATE_PRODUCT.value,
  USP_CREATE_PRODUCTSET:
    StoredProcedureConstantsSchema.shape.USP_CREATE_PRODUCTSET.value,
  USP_CREATE_ROLE: StoredProcedureConstantsSchema.shape.USP_CREATE_ROLE.value,
  USP_CREATE_VENDOR:
    StoredProcedureConstantsSchema.shape.USP_CREATE_VENDOR.value,
  USP_DELETE_ASSET: StoredProcedureConstantsSchema.shape.USP_DELETE_ASSET.value,
  USP_DELETE_ASSETFIX:
    StoredProcedureConstantsSchema.shape.USP_DELETE_ASSETFIX.value,
  USP_DELETE_ASSETISSUE:
    StoredProcedureConstantsSchema.shape.USP_DELETE_ASSETISSUE.value,
  USP_DELETE_BUILDING:
    StoredProcedureConstantsSchema.shape.USP_DELETE_BUILDING.value,
  USP_DELETE_CATEGORY:
    StoredProcedureConstantsSchema.shape.USP_DELETE_CATEGORY.value,
  USP_DELETE_COMPANY:
    StoredProcedureConstantsSchema.shape.USP_DELETE_COMPANY.value,
  USP_DELETE_DEPARTMENT:
    StoredProcedureConstantsSchema.shape.USP_DELETE_DEPARTMENT.value,
  USP_DELETE_EMPLOYEE:
    StoredProcedureConstantsSchema.shape.USP_DELETE_EMPLOYEE.value,
  USP_DELETE_ENDUSER:
    StoredProcedureConstantsSchema.shape.USP_DELETE_ENDUSER.value,
  USP_DELETE_ENDUSERROLE:
    StoredProcedureConstantsSchema.shape.USP_DELETE_ENDUSERROLE.value,
  USP_DELETE_LOCATION:
    StoredProcedureConstantsSchema.shape.USP_DELETE_LOCATION.value,
  USP_DELETE_LOG: StoredProcedureConstantsSchema.shape.USP_DELETE_LOG.value,
  USP_DELETE_MANUFACTURER:
    StoredProcedureConstantsSchema.shape.USP_DELETE_MANUFACTURER.value,
  USP_DELETE_PRODUCT:
    StoredProcedureConstantsSchema.shape.USP_DELETE_PRODUCT.value,
  USP_DELETE_PRODUCTSET:
    StoredProcedureConstantsSchema.shape.USP_DELETE_PRODUCTSET.value,
  USP_DELETE_ROLE: StoredProcedureConstantsSchema.shape.USP_DELETE_ROLE.value,
  USP_DELETE_VENDOR:
    StoredProcedureConstantsSchema.shape.USP_DELETE_VENDOR.value,
  USP_READ_ASSET: StoredProcedureConstantsSchema.shape.USP_READ_ASSET.value,
  USP_READ_ASSETFIX:
    StoredProcedureConstantsSchema.shape.USP_READ_ASSETFIX.value,
  USP_READ_ASSETISSUE:
    StoredProcedureConstantsSchema.shape.USP_READ_ASSETISSUE.value,
  USP_READ_BUILDING:
    StoredProcedureConstantsSchema.shape.USP_READ_BUILDING.value,
  USP_READ_CATEGORY:
    StoredProcedureConstantsSchema.shape.USP_READ_CATEGORY.value,
  USP_READ_COMPANY: StoredProcedureConstantsSchema.shape.USP_READ_COMPANY.value,
  USP_READ_DEPARTMENT:
    StoredProcedureConstantsSchema.shape.USP_READ_DEPARTMENT.value,
  USP_READ_EMPLOYEE:
    StoredProcedureConstantsSchema.shape.USP_READ_EMPLOYEE.value,
  USP_READ_ENDUSER: StoredProcedureConstantsSchema.shape.USP_READ_ENDUSER.value,
  USP_READ_ENDUSERROLE:
    StoredProcedureConstantsSchema.shape.USP_READ_ENDUSERROLE.value,
  USP_READ_LOCATION:
    StoredProcedureConstantsSchema.shape.USP_READ_LOCATION.value,
  USP_READ_LOG: StoredProcedureConstantsSchema.shape.USP_READ_LOG.value,
  USP_READ_MANUFACTURER:
    StoredProcedureConstantsSchema.shape.USP_READ_MANUFACTURER.value,
  USP_READ_PRODUCT: StoredProcedureConstantsSchema.shape.USP_READ_PRODUCT.value,
  USP_READ_PRODUCTSET:
    StoredProcedureConstantsSchema.shape.USP_READ_PRODUCTSET.value,
  USP_READ_ROLE: StoredProcedureConstantsSchema.shape.USP_READ_ROLE.value,
  USP_READ_VENDOR: StoredProcedureConstantsSchema.shape.USP_READ_VENDOR.value,
  USP_UPDATE_ASSET: StoredProcedureConstantsSchema.shape.USP_UPDATE_ASSET.value,
  USP_UPDATE_ASSETFIX:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_ASSETFIX.value,
  USP_UPDATE_ASSETISSUE:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_ASSETISSUE.value,
  USP_UPDATE_BUILDING:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_BUILDING.value,
  USP_UPDATE_CATEGORY:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_CATEGORY.value,
  USP_UPDATE_COMPANY:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_COMPANY.value,
  USP_UPDATE_DEPARTMENT:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_DEPARTMENT.value,
  USP_UPDATE_EMPLOYEE:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_EMPLOYEE.value,
  USP_UPDATE_ENDUSER:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_ENDUSER.value,
  USP_UPDATE_ENDUSERROLE:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_ENDUSERROLE.value,
  USP_UPDATE_LOCATION:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_LOCATION.value,
  USP_UPDATE_MANUFACTURER:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_MANUFACTURER.value,
  USP_UPDATE_PRODUCT:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_PRODUCT.value,
  USP_UPDATE_PRODUCTSET:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_PRODUCTSET.value,
  USP_UPDATE_ROLE: StoredProcedureConstantsSchema.shape.USP_UPDATE_ROLE.value,
  USP_UPDATE_VENDOR:
    StoredProcedureConstantsSchema.shape.USP_UPDATE_VENDOR.value,
} as const;

export const {
  USP_CREATE_ASSET,
  USP_CREATE_ASSETFIX,
  USP_CREATE_ASSETISSUE,
  USP_CREATE_AUTHENTICATION,
  USP_CREATE_BUILDING,
  USP_CREATE_CATEGORY,
  USP_CREATE_COMPANY,
  USP_CREATE_DEPARTMENT,
  USP_CREATE_EMPLOYEE,
  USP_CREATE_ENDUSER,
  USP_CREATE_ENDUSERROLE,
  USP_CREATE_LOCATION,
  USP_CREATE_LOG,
  USP_CREATE_MANUFACTURER,
  USP_CREATE_PRODUCT,
  USP_CREATE_PRODUCTSET,
  USP_CREATE_ROLE,
  USP_CREATE_VENDOR,
  USP_DELETE_ASSET,
  USP_DELETE_ASSETFIX,
  USP_DELETE_ASSETISSUE,
  USP_DELETE_BUILDING,
  USP_DELETE_CATEGORY,
  USP_DELETE_COMPANY,
  USP_DELETE_DEPARTMENT,
  USP_DELETE_EMPLOYEE,
  USP_DELETE_ENDUSER,
  USP_DELETE_ENDUSERROLE,
  USP_DELETE_LOCATION,
  USP_DELETE_LOG,
  USP_DELETE_MANUFACTURER,
  USP_DELETE_PRODUCT,
  USP_DELETE_PRODUCTSET,
  USP_DELETE_ROLE,
  USP_DELETE_VENDOR,
  USP_READ_ASSET,
  USP_READ_ASSETFIX,
  USP_READ_ASSETISSUE,
  USP_READ_BUILDING,
  USP_READ_CATEGORY,
  USP_READ_COMPANY,
  USP_READ_DEPARTMENT,
  USP_READ_EMPLOYEE,
  USP_READ_ENDUSER,
  USP_READ_ENDUSERROLE,
  USP_READ_LOCATION,
  USP_READ_LOG,
  USP_READ_MANUFACTURER,
  USP_READ_PRODUCT,
  USP_READ_PRODUCTSET,
  USP_READ_ROLE,
  USP_READ_VENDOR,
  USP_UPDATE_ASSET,
  USP_UPDATE_ASSETFIX,
  USP_UPDATE_ASSETISSUE,
  USP_UPDATE_BUILDING,
  USP_UPDATE_CATEGORY,
  USP_UPDATE_COMPANY,
  USP_UPDATE_DEPARTMENT,
  USP_UPDATE_EMPLOYEE,
  USP_UPDATE_ENDUSER,
  USP_UPDATE_ENDUSERROLE,
  USP_UPDATE_LOCATION,
  USP_UPDATE_MANUFACTURER,
  USP_UPDATE_PRODUCT,
  USP_UPDATE_PRODUCTSET,
  USP_UPDATE_ROLE,
  USP_UPDATE_VENDOR,
}: StoredProcedureConstants = storedProcedureConstants;
