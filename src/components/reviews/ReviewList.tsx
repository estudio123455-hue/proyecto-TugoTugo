'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import StarRating from './StarRating'
import ReviewForm from './ReviewForm'
import { Edit2, Trash2, User, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface ReviewListProps {
  establishmentId: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export default function ReviewList({
  establishmentId,
  reviews,
  averageRating,
  totalReviews,
}: ReviewListProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)

  const handleDelete = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return
    }

    setDeletingReviewId(reviewId)

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la reseña')
      }

      router.refresh()
    } catch (error) {
      alert('Error al eliminar la reseña')
    } finally {
      setDeletingReviewId(null)
    }
  }

  const userReview = reviews.find((review) => review.user.id === session?.user?.id)
  const otherReviews = reviews.filter((review) => review.user.id !== session?.user?.id)

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { stars, count, percentage }
  })

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {totalReviews > 0 ? averageRating.toFixed(1) : '0.0'}
            </div>
            <StarRating rating={averageRating} readonly size="lg" />
            <p className="text-sm text-gray-600 mt-2">
              {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{stars}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User's Review or Review Form */}
      {session && (
        <div>
          {userReview && editingReviewId !== userReview.id ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Tu reseña</p>
                  <StarRating rating={userReview.rating} readonly />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingReviewId(userReview.id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Editar reseña"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(userReview.id)}
                    disabled={deletingReviewId === userReview.id}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar reseña"
                  >
                    {deletingReviewId === userReview.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {userReview.comment && (
                <p className="text-gray-700 text-sm">{userReview.comment}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {formatDistanceToNow(new Date(userReview.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
          ) : editingReviewId === userReview?.id ? (
            <ReviewForm
              establishmentId={establishmentId}
              existingReview={userReview}
              onSuccess={() => setEditingReviewId(null)}
              onCancel={() => setEditingReviewId(null)}
            />
          ) : (
            <ReviewForm establishmentId={establishmentId} />
          )}
        </div>
      )}

      {/* Other Reviews */}
      {otherReviews.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reseñas de clientes
          </h3>
          <div className="space-y-4">
            {otherReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {review.user.image ? (
                      <img
                        src={review.user.image}
                        alt={review.user.name || 'Usuario'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.user.name || 'Usuario Anónimo'}
                        </p>
                        <StarRating rating={review.rating} readonly size="sm" />
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Reviews */}
      {reviews.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Aún no hay reseñas</p>
          <p className="text-sm text-gray-500">
            ¡Sé el primero en dejar una reseña!
          </p>
        </div>
      )}
    </div>
  )
}

// Missing Star import
function Star({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}
