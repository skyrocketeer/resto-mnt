import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Tag,
  DollarSign,
  Clock,
  Image,
  Archive
} from 'lucide-react'
import apiClient from '@/api/client'
import { toastHelpers } from '@/lib/toast-helpers'
import { ProductForm } from '@/components/forms/ProductForm'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { PaginationControlsComponent } from '@/components/ui/pagination-controls'
import { usePagination } from '@/hooks/usePagination'
import { ProductListSkeleton, CategoryListSkeleton, SearchingSkeleton } from '@/components/ui/skeletons'
import { InlineLoading } from '@/components/ui/loading-spinner'
import type { Product, Category } from '@/types'

type ViewMode = 'list' | 'product-form' | 'category-form'

export function AdminMenuManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const queryClient = useQueryClient()

  // Pagination hooks
  const productsPagination = usePagination({ 
    initialPage: 1, 
    initialPageSize: 10,
    total: 0 
  })
  
  const categoriesPagination = usePagination({ 
    initialPage: 1, 
    initialPageSize: 10,
    total: 0 
  })

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearch) {
      setIsSearching(true)
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      // Reset pagination when search changes
      productsPagination.goToFirstPage()
      categoriesPagination.goToFirstPage()
      setIsSearching(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, debouncedSearch])

  // Fetch products with pagination
  const { data: productsData, isLoading: isLoadingProducts, isFetching: isFetchingProducts } = useQuery({
    queryKey: ['admin-products', productsPagination.page, productsPagination.pageSize, debouncedSearch],
    queryFn: () => apiClient.getAdminProducts({
      page: productsPagination.page,
      limit: productsPagination.pageSize,
      search: debouncedSearch || undefined
    }).then(res => res.data),
    keepPreviousData: true,
  })

  // Fetch categories with pagination  
  const { data: categoriesData, isLoading: isLoadingCategories, isFetching: isFetchingCategories } = useQuery({
    queryKey: ['admin-categories', categoriesPagination.page, categoriesPagination.pageSize, debouncedSearch],
    queryFn: () => apiClient.getAdminCategories({
      page: categoriesPagination.page,
      limit: categoriesPagination.pageSize,
      search: debouncedSearch || undefined
    }).then(res => res.data),
    keepPreviousData: true,
  })

  // For forms, we still need all categories for the dropdown
  const { data: allCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories().then(res => res.data)
  })

  // Extract data and pagination info
  const products = Array.isArray(productsData) ? productsData : (productsData as any)?.data || []
  const productsPaginationInfo = (productsData as any)?.pagination || { total: 0 }
  
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData as any)?.data || []
  const categoriesPaginationInfo = (categoriesData as any)?.pagination || { total: 0 }

  // Update pagination totals
  useEffect(() => {
    if (productsPaginationInfo.total !== undefined) {
      productsPagination.goToPage(productsPagination.page) // This will update internal state
    }
  }, [productsPaginationInfo.total])

  useEffect(() => {
    if (categoriesPaginationInfo.total !== undefined) {
      categoriesPagination.goToPage(categoriesPagination.page)
    }
  }, [categoriesPaginationInfo.total])

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: ({ id, name }: { id: string, name: string }) => apiClient.deleteProduct(id),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toastHelpers.apiSuccess('Delete', `Product "${name}"`)
    },
    onError: (error: any) => {
      toastHelpers.apiError('Delete product', error)
    }
  })

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: string, name: string }) => apiClient.deleteCategory(id),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toastHelpers.apiSuccess('Delete', `Category "${name}"`)
    },
    onError: (error: any) => {
      toastHelpers.apiError('Delete category', error)
    }
  })

  // Form handlers
  const handleFormSuccess = () => {
    setViewMode('list')
    setEditingProduct(null)
    setEditingCategory(null)
  }

  const handleCancelForm = () => {
    setViewMode('list')
    setEditingProduct(null)
    setEditingCategory(null)
  }

  // Delete handlers
  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate({ 
        id: product.id.toString(), 
        name: product.name 
      })
    }
  }

  const handleDeleteCategory = (category: Category) => {
    const productsInCategory = products.filter(p => p.category_id === category.id)
    
    if (productsInCategory.length > 0) {
      toastHelpers.warning(
        'Cannot Delete Category', 
        `"${category.name}" contains ${productsInCategory.length} products. Move or delete those products first.`
      )
      return
    }

    if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      deleteCategoryMutation.mutate({ 
        id: category.id.toString(), 
        name: category.name 
      })
    }
  }

  // Data is already filtered on the server side, so we use it directly
  const filteredProducts = products
  const filteredCategories = categories

  // Show forms
  if (viewMode === 'product-form') {
    return (
      <div className="p-6">
        <ProductForm
          product={editingProduct || undefined}
          mode={editingProduct ? 'edit' : 'create'}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelForm}
        />
      </div>
    )
  }

  if (viewMode === 'category-form') {
    return (
      <div className="p-6">
        <CategoryForm
          category={editingCategory || undefined}
          mode={editingCategory ? 'edit' : 'create'}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelForm}
        />
      </div>
    )
  }

  // Main list view
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
          <p className="text-muted-foreground">
            Manage your restaurant's products and categories
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products ({productsPaginationInfo.total || products.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tag className="h-4 w-4" />
            Categories ({categoriesPaginationInfo.total || categories.length})
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Products Controls */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button 
              onClick={() => {
                setEditingProduct(null)
                setViewMode('product-form')
              }} 
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          {/* Products List */}
          {isLoadingProducts ? (
            <ProductListSkeleton count={productsPagination.pageSize} />
          ) : isSearching && searchTerm ? (
            <SearchingSkeleton />
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No products match your search.' : 'Get started by adding your first product.'}
                  </p>
                  {!searchTerm && (
                    <div className="mt-6">
                      <Button onClick={() => setViewMode('product-form')} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredProducts.map((product) => {
                const category = allCategories.find(c => c.id === product.category_id)
                return (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Image className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{product.name}</h3>
                              <Badge 
                                variant={product.status === 'active' ? 'default' : 'secondary'}
                                className="gap-1"
                              >
                                {product.status === 'active' ? (
                                  <Package className="h-3 w-3" />
                                ) : (
                                  <Archive className="h-3 w-3" />
                                )}
                                {product.status}
                              </Badge>
                            </div>
                            {product.description && (
                              <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Tag className="h-4 w-4" />
                                {category?.name || 'No Category'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {product.preparation_time || 5}min
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProduct(product)
                              setViewMode('product-form')
                            }}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={deleteProductMutation.isPending}
                            className="gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          
          {/* Pagination for Products */}
          {filteredProducts.length > 0 && (
            <div className="mt-6 space-y-4">
              {isFetchingProducts && !isLoadingProducts && (
                <div className="flex justify-center">
                  <InlineLoading text="Updating products..." />
                </div>
              )}
              <PaginationControlsComponent
                pagination={productsPagination}
                total={productsPaginationInfo.total || products.length}
              />
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {/* Categories Controls */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button 
              onClick={() => {
                setEditingCategory(null)
                setViewMode('category-form')
              }} 
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          {/* Categories List */}
          {isLoadingCategories ? (
            <CategoryListSkeleton count={categoriesPagination.pageSize} />
          ) : isSearching && searchTerm ? (
            <SearchingSkeleton />
          ) : filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Tag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No categories match your search.' : 'Get started by creating your first category.'}
                  </p>
                  {!searchTerm && (
                    <div className="mt-6">
                      <Button onClick={() => setViewMode('category-form')} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Category
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCategories.map((category) => {
                // Note: This is a simplified check - in production you'd want to check the total count from the API
                const productsInCategory = products.filter(p => p.category_id === category.id)
                return (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {category.image_url ? (
                            <img 
                              src={category.image_url} 
                              alt={category.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Tag className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{category.name}</h3>
                              <Badge variant="outline">
                                {productsInCategory.length} products
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Sort Order: {category.sort_order || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(category)
                              setViewMode('category-form')
                            }}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={deleteCategoryMutation.isPending}
                            className="gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pagination for Categories */}
          {filteredCategories.length > 0 && (
            <div className="mt-6 space-y-4">
              {isFetchingCategories && !isLoadingCategories && (
                <div className="flex justify-center">
                  <InlineLoading text="Updating categories..." />
                </div>
              )}
              <PaginationControlsComponent
                pagination={categoriesPagination}
                total={categoriesPaginationInfo.total || categories.length}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}