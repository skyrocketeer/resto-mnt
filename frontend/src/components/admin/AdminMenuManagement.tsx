import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  DollarSign,
  Package,
  Utensils,
  Image as ImageIcon,
  Tag,
  Eye
} from 'lucide-react'
import apiClient from '@/api/client'
import type { Product, Category } from '@/types'

interface CreateProductForm {
  name: string
  description: string
  price: string
  category_id: string
  image_url: string
  available: boolean
}

interface CreateCategoryForm {
  name: string
  description: string
}

export function AdminMenuManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [showCreateProductForm, setShowCreateProductForm] = useState(false)
  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategoryEdit, setSelectedCategoryEdit] = useState<Category | null>(null)
  
  const [createProductForm, setCreateProductForm] = useState<CreateProductForm>({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    available: true
  })

  const [createCategoryForm, setCreateCategoryForm] = useState<CreateCategoryForm>({
    name: '',
    description: ''
  })

  const queryClient = useQueryClient()

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts().then(res => res.data)
  })

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories().then(res => res.data)
  })

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: (productData: CreateProductForm) => {
      const data = {
        ...productData,
        price: parseFloat(productData.price),
        category_id: parseInt(productData.category_id)
      }
      return apiClient.createProduct(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowCreateProductForm(false)
      resetProductForm()
      alert('Product created successfully!')
    },
    onError: (error: any) => {
      alert(`Failed to create product: ${error.message}`)
    }
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, productData }: { id: string, productData: Partial<Product> }) => 
      apiClient.updateProduct(id, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setSelectedProduct(null)
      alert('Product updated successfully!')
    },
    onError: (error: any) => {
      alert(`Failed to update product: ${error.message}`)
    }
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      alert('Product deleted successfully!')
    },
    onError: (error: any) => {
      alert(`Failed to delete product: ${error.message}`)
    }
  })

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: CreateCategoryForm) => apiClient.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowCreateCategoryForm(false)
      resetCategoryForm()
      alert('Category created successfully!')
    },
    onError: (error: any) => {
      alert(`Failed to create category: ${error.message}`)
    }
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, categoryData }: { id: string, categoryData: Partial<Category> }) => 
      apiClient.updateCategory(id, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setSelectedCategoryEdit(null)
      alert('Category updated successfully!')
    },
    onError: (error: any) => {
      alert(`Failed to update category: ${error.message}`)
    }
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      alert('Category deleted successfully!')
    },
    onError: (error: any) => {
      alert(`Failed to delete category: ${error.message}`)
    }
  })

  const resetProductForm = () => {
    setCreateProductForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      available: true
    })
  }

  const resetCategoryForm = () => {
    setCreateCategoryForm({
      name: '',
      description: ''
    })
  }

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createProductForm.name || !createProductForm.price || !createProductForm.category_id) {
      alert('Please fill in all required fields')
      return
    }
    createProductMutation.mutate(createProductForm)
  }

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createCategoryForm.name) {
      alert('Please enter a category name')
      return
    }
    createCategoryMutation.mutate(createCategoryForm)
  }

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id.toString())
    }
  }

  const handleDeleteCategory = (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"? This will affect all products in this category.`)) {
      deleteCategoryMutation.mutate(category.id.toString())
    }
  }

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category_id.toString() === selectedCategory
    return matchesSearch && matchesCategory
  }) || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const isLoading = productsLoading || categoriesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
          <p className="text-muted-foreground">
            Manage restaurant menu items and categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'categories' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('categories')}
          >
            <Tag className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button 
            variant={activeTab === 'products' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('products')}
          >
            <Package className="w-4 h-4 mr-2" />
            Products
          </Button>
        </div>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                className="p-2 border border-input rounded-md bg-background"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories?.map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>

              <Badge variant="outline">
                {filteredProducts.length} products
              </Badge>
            </div>

            <Button onClick={() => setShowCreateProductForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Create Product Form */}
          {showCreateProductForm && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Product Name</label>
                      <Input
                        value={createProductForm.name}
                        onChange={(e) => setCreateProductForm({...createProductForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Price ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={createProductForm.price}
                        onChange={(e) => setCreateProductForm({...createProductForm, price: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Input
                      value={createProductForm.description}
                      onChange={(e) => setCreateProductForm({...createProductForm, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <select
                        className="w-full p-2 border border-input rounded-md bg-background"
                        value={createProductForm.category_id}
                        onChange={(e) => setCreateProductForm({...createProductForm, category_id: e.target.value})}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories?.map(category => (
                          <option key={category.id} value={category.id.toString()}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Image URL (Optional)</label>
                      <Input
                        value={createProductForm.image_url}
                        onChange={(e) => setCreateProductForm({...createProductForm, image_url: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={createProductForm.available}
                      onChange={(e) => setCreateProductForm({...createProductForm, available: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="available" className="text-sm font-medium">
                      Available for sale
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateProductForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createProductMutation.isPending}
                    >
                      {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Products Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const category = categories?.find(c => c.id === product.category_id)
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={product.image_url ? 'hidden' : 'flex items-center justify-center text-muted-foreground'}>
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <Badge variant={product.available ? 'default' : 'secondary'}>
                          {product.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        <Badge variant="outline">
                          {category?.name || 'Unknown'}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {filteredProducts.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No products found</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowCreateProductForm(true)}
                  >
                    Add Your First Product
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {categories?.length || 0} categories
            </Badge>
            <Button onClick={() => setShowCreateCategoryForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Create Category Form */}
          {showCreateCategoryForm && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Add New Category</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category Name</label>
                    <Input
                      value={createCategoryForm.name}
                      onChange={(e) => setCreateCategoryForm({...createCategoryForm, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                    <Input
                      value={createCategoryForm.description}
                      onChange={(e) => setCreateCategoryForm({...createCategoryForm, description: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateCategoryForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createCategoryMutation.isPending}
                    >
                      {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Categories List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories?.map((category) => {
              const productCount = products?.filter(p => p.category_id === category.id).length || 0
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {category.description || 'No description'}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {productCount} items
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedCategoryEdit(category)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {(!categories || categories.length === 0) && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="p-12 text-center">
                  <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No categories found</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowCreateCategoryForm(true)}
                  >
                    Add Your First Category
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
