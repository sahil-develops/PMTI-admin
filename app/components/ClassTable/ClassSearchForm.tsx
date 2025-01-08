'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"

const searchFormSchema = z.object({
  limit: z.string().optional(),
  page: z.string().optional(),
  sort: z.string().optional(),
  courseCategory: z.string().optional(),
  classType: z.string().optional(),
  locationId: z.string().optional(),
  instructorId: z.string().optional(),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

export function ClassSearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      limit: searchParams.get('limit') || '5',
      page: searchParams.get('page') || '1',
      sort: searchParams.get('sort') || 'id:DESC',
      courseCategory: searchParams.get('courseCategory') || '',
      classType: searchParams.get('classType') || '',
      locationId: searchParams.get('locationId') || '',
      instructorId: searchParams.get('instructorId') || '',
    },
  })

  function onSubmit(data: SearchFormValues) {
    // Build query string from form data
    const queryParams = new URLSearchParams()
    
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value)
      }
    })

    // Navigate to the new URL with search params
    router.push(`/class?${queryParams.toString()}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="courseCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">PMP</SelectItem>
                    <SelectItem value="2">Agile</SelectItem>
                    {/* Add more categories as needed */}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Online</SelectItem>
                    <SelectItem value="2">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Washington DC</SelectItem>
                    <SelectItem value="2">New York</SelectItem>
                    {/* Add more locations */}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">John Doe</SelectItem>
                    <SelectItem value="2">Jane Smith</SelectItem>
                    {/* Add more instructors */}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Items per page</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort By</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sort" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="id:DESC">Newest First</SelectItem>
                    <SelectItem value="id:ASC">Oldest First</SelectItem>
                    {/* Add more sorting options */}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Search Classes
        </Button>
      </form>
    </Form>
  )
} 