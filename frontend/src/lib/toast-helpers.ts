import { toast } from "@/hooks/use-toast"

export const toastHelpers = {
  success: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "success",
      duration: 4000,
    })
  },

  error: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "destructive",
      duration: 6000,
    })
  },

  warning: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "warning", 
      duration: 5000,
    })
  },

  info: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "default",
      duration: 4000,
    })
  },

  // API Response helpers
  apiSuccess: (action: string, entity?: string) => {
    return toastHelpers.success(
      `Thao tác ${action} thành công`,
      entity ? `Đã ${action.toLowerCase()} ${entity} thành công.` : 'Thao tác thành công.'
    )
  },

  apiError: (action: string, error?: string) => {
    const errorMessage = error || 'Lỗi không xác định'
    return toastHelpers.error(
      `Thao tác ${action} thất bại`,
      errorMessage
    )
  },

  // Common POS operations
  orderCreated: (orderNumber?: string) => {
    return toastHelpers.success(
      "Đơn hàng đã được tạo",
      orderNumber ? `Đơn hàng ${orderNumber} đã được tạo thành công.` : "Đơn hàng đã được tạo thành công."
    )
  },

  paymentProcessed: (amount?: number) => {
    return toastHelpers.success(
      "Thanh toán thành công",
      amount ? `Thanh toán $${amount.toFixed(2)} thành công.` : "Thanh toán thành công."
    )
  },

  userCreated: (username: string) => {
    return toastHelpers.success(
      "Người dùng đã được tạo",
      `Người dùng "${username}" đã được tạo thành công.`
    )
  },

  userDeleted: (username: string) => {
    return toastHelpers.success(
      "Người dùng đã được xóa", 
      `Người dùng "${username}" đã được xóa thành công.`
    )
  },

  productCreated: (productName: string) => {
    return toastHelpers.success(
      "Sản phẩm đã được thêm",
      `"${productName}" đã được thêm vào menu.`
    )
  },

  productDeleted: (productName: string = 'Sản phẩm') => {
    return toastHelpers.success(
      "Sản phẩm đã được xóa",
      `"${productName}" đã được xóa thành công.`
    )
  },

  categoryCreated: (categoryName: string) => {
    return toastHelpers.success(
      "Danh mục đã được tạo",
      `Danh mục "${categoryName}" đã được tạo thành công.`
    )
  },

  categoryDeleted: (categoryName: string) => {
    return toastHelpers.success(
      "Danh mục đã được xóa",
      `Danh mục "${categoryName}" đã được xóa thành công.`
    )
  },

  productUpdated: (productName: string) => {
    return toastHelpers.success(
      "Sản phẩm đã được cập nhật",
      `"${productName}" đã được cập nhật thành công.`
    )
  },

  categoryUpdated: (categoryName: string) => {
    return toastHelpers.success(
      "Danh mục đã được cập nhật",  
      `Danh mục "${categoryName}" đã được cập nhật thành công.`
    )
  },

  tableCreated: (tableNumber: string) => {
    return toastHelpers.success(
      "Bàn đã được tạo",
      `Bàn ${tableNumber} đã được tạo thành công.`
    )
  },

  tableUpdated: (tableNumber: string) => {
    return toastHelpers.success(
      "Bàn đã được cập nhật", 
      `Bàn ${tableNumber} đã được cập nhật thành công.`
    )
  },

  // Validation and form errors
  validationError: (message: string) => {
    return toastHelpers.error(
      "Lỗi xác thực",
      message
    )
  },

  networkError: () => {
    return toastHelpers.error(
      "Lỗi kết nối",
      "Vui lòng kiểm tra kết nối và thử lại."
    )
  },

  permissionDenied: () => {
    return toastHelpers.error(
      "Quyền truy cập bị từ chối",
      "Bạn không có quyền thực hiện hành động này."
    )
  }
}

