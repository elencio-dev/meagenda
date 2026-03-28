"use client"

import { useState, useEffect } from "react"
import { 
  Plus,
  MoreHorizontal,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Scissors,
  Sparkles,
  Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Servico = {
  id: number
  name: string
  description: string
  price: number
  duration: number
  category: string
  active: boolean
  popular: boolean
}

const categories = ["Todos", "Cabelo", "Barba", "Coloração", "Tratamento", "Unhas", "Combo"]

export default function ServicosPage() {
  const [services, setServices] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formDuration, setFormDuration] = useState("")
  const [formCategory, setFormCategory] = useState("")

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/servicos")
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch {
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchServices() }, [])

  const toggleActive = async (id: number, active: boolean) => {
    // Optimistic update
    setServices(prev => prev.map(s => s.id === id ? { ...s, active } : s))
    await fetch("/api/servicos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    })
  }

  const togglePopular = async (id: number, popular: boolean) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, popular } : s))
    await fetch("/api/servicos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, popular }),
    })
  }

  const deleteService = async (id: number) => {
    setServices(prev => prev.filter(s => s.id !== id))
    await fetch(`/api/servicos?id=${id}`, { method: "DELETE" })
  }

  const handleCreate = async () => {
    if (!formName || !formPrice || !formDuration || !formCategory) return
    setSubmitting(true)
    try {
      await fetch("/api/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDesc,
          price: Number(formPrice),
          duration: Number(formDuration),
          category: formCategory,
        }),
      })
      setDialogOpen(false)
      setFormName(""); setFormDesc(""); setFormPrice(""); setFormDuration(""); setFormCategory("")
      fetchServices()
    } finally {
      setSubmitting(false)
    }
  }

  const filteredServices = services.filter(service => 
    selectedCategory === "Todos" || service.category === selectedCategory
  )

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }
    return `${minutes}min`
  }

  // Stats
  const activeCount = services.filter(s => s.active).length
  const popularCount = services.filter(s => s.popular).length
  const avgPrice = services.length > 0 
    ? Math.round(services.reduce((a, s) => a + s.price, 0) / services.length) 
    : 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl text-[var(--ink)]">Serviços</h1>
          <p className="text-[var(--ink-60)] mt-1">Gerencie seus serviços e preços</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-sans text-xl">Novo Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do serviço</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: Corte Feminino" className="border-[var(--ink-10)]" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Descreva o serviço..." className="border-[var(--ink-10)] resize-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="0,00" className="border-[var(--ink-10)]" />
                </div>
                <div className="space-y-2">
                  <Label>Duração (min)</Label>
                  <Input type="number" value={formDuration} onChange={e => setFormDuration(e.target.value)} placeholder="30" className="border-[var(--ink-10)]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="border-[var(--ink-10)]">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cabelo">Cabelo</SelectItem>
                    <SelectItem value="Barba">Barba</SelectItem>
                    <SelectItem value="Coloração">Coloração</SelectItem>
                    <SelectItem value="Tratamento">Tratamento</SelectItem>
                    <SelectItem value="Unhas">Unhas</SelectItem>
                    <SelectItem value="Combo">Combo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Serviço
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[var(--ink-10)] shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-[var(--ink-60)]">Total de Serviços</p>
            <p className="text-2xl font-semibold text-[var(--ink)] mt-1">{services.length}</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--ink-10)] shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-[var(--ink-60)]">Serviços Ativos</p>
            <p className="text-2xl font-semibold text-[var(--success)] mt-1">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--ink-10)] shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-[var(--ink-60)]">Preço Médio</p>
            <p className="text-2xl font-semibold text-[var(--ink)] mt-1">R$ {avgPrice}</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--ink-10)] shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-[var(--ink-60)]">Populares</p>
            <p className="text-2xl font-semibold text-[var(--coral)] mt-1">{popularCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "whitespace-nowrap",
              selectedCategory === category 
                ? "bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white" 
                : "border-[var(--ink-10)] text-[var(--ink-60)] hover:bg-[var(--coral-pale)] hover:text-[var(--coral-dark)] hover:border-[var(--coral-light)]"
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Services list */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--coral)]" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredServices.map((service) => (
            <Card 
              key={service.id} 
              className={cn(
                "border-[var(--ink-10)] shadow-sm transition-all",
                !service.active && "opacity-60"
              )}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      service.active ? "bg-[var(--coral-pale)]" : "bg-[var(--ink-10)]"
                    )}>
                      <Scissors className={cn(
                        "h-5 w-5",
                        service.active ? "text-[var(--coral)]" : "text-[var(--ink-60)]"
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-[var(--ink)]">{service.name}</h3>
                        {service.popular && (
                          <Badge className="bg-[var(--coral-pale)] text-[var(--coral)] hover:bg-[var(--coral-pale)] border-0">
                            <Sparkles className="h-3 w-3 mr-1" />Popular
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-[var(--ink-10)] text-[var(--ink-60)]">
                          {service.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--ink-60)] mt-1 line-clamp-1">{service.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-[var(--ink-60)]">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-[var(--ink)]">R$ {service.price}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--ink-60)]">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={service.active} 
                        onCheckedChange={(checked) => toggleActive(service.id, checked)}
                        className="data-[state=checked]:bg-[var(--coral)]"
                      />
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4 text-[var(--ink-60)]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePopular(service.id, !service.popular)}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {service.popular ? "Remover destaque" : "Destacar"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-[var(--error)]"
                            onClick={() => deleteService(service.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredServices.length === 0 && (
        <Card className="border-[var(--ink-10)]">
          <CardContent className="p-12 text-center">
            <Scissors className="h-12 w-12 mx-auto text-[var(--ink-30)] mb-4" />
            <p className="text-[var(--ink-60)]">Nenhum serviço encontrado nesta categoria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
