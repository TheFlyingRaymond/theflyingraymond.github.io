---
icon: pen-to-square
date: 2025-01-04
category:
  - 计算机
tag:
  - coding
---

# 二分搜索详解

关于二分搜索的故事
<!-- more -->

::: details Summary
1. 掌握四种写法，以简单问题测试
2. 掌握处理最左、最右问题的方式
3. 整理二分搜索解决的问题，培养二分的敏感
:::

## 一、四种二分搜索的方式
::: important 非常值得注意的一点
我们在取`mid`的时候，无论是直接`left+(right-left)/2`还是`(left+right)>>>1`，做的都是整数除法，都是向下取整，这么一来，如果我们在处理left指针的时候，单纯的让`left = mid`，可能会出现 `left` 一直没有移动而导致的死循环，所以，如果用向下取整，那么我们一定要移动 `left` 指针（具体方式见后文）
::: 

二分搜索写法的核心在于两点：一是刚刚重点标出的 left 指针移动，二是区间边界一致性。我们根据区间两端的开闭性，可以划分为四种类型：左闭右闭、左闭右开、左开右闭以及左开右开，而所谓的区间边界一致性，指的是我们在移动指针的过程中，始终要保持区间特性的一致，比如说，我们一开始将 right 指向 array.length，这是一个数组外的索引，所以我们的选择的策略是一种右开的策略，即右指针不包含在候选范围内，当我们根据 mid 指针判断需要移动 right 指针时，是 right = mid 还是 right = mid-1 还是 right = mid+1？此时 mid 指针的位置其实已经是候选区间外了，所以 right = mid 是最合适的方案。其余方案要么会丢失元素，要么会重复计算引发一些预期之外的问题。
下面看四种写法：
### 1.1  左闭右闭
JDK里的数组二分查找就是用的这种,入参的 fromIndex 是 0， toIndex 是 array.length，可以看到它将 left 指向开始元素，而 right 指向的则是 toIndex-1，即 [left,right] 是答案的候选区间。循环终止条件是 left>right。
```java
//JDK里的代码
private static int binarySearch0(int[] a, int fromIndex, int toIndex, int key) {
        int low = fromIndex;
        int high = toIndex - 1;//因为是闭区间，而toIndex是不在区间内的，所以需要-1

        while (low <= high) {
            int mid = (low + high) >>> 1;
            int midVal = a[mid];

            //这里的low和high分别在mid上进行加一和减一操作，也与左闭右闭保持了一致性
            if (midVal < key)
                low = mid + 1;
            else if (midVal > key)
                high = mid - 1;
            else
                return mid; // key found
        }
        //这里针对 low==0 而无法判断是否找到的情况
        return -(low + 1);  // key not found.
    }
```
### 1.2  左闭右开
右开代表右指针处在候选区间外，所以响应的 right 就被初始化为 nums.length，并且，也因为 right 指向的是候选区间外，当 left == right 时，表示候选区间已经为空了，即此时可以跳出循环
```java
public static int binarySearch1(int[] nums, int target) {
        if(nums == null || nums.length == 0)return -1;
        int left = 0,right = nums.length;
        //注意循环终止条件变了
        while (left < right) {
            int mid = (left+right)>>>1;
            if(target == nums[mid])
                return mid;//右开区间，即右指针永远指向搜索区间外
            else if(target<nums[mid])
                right = mid;
            else if(target>nums[mid])
                left = mid+1;
        }
        //循环终止条件是 left == right，而right永远指向搜索区间外，即此时一定是没有找到target
        return -1;
    }
```
### 1.3  左开右闭与左开右开
左闭的写法中，left 的移动始终是 mid+1，所以不存在之前提到的死循环的问题，而左开的写法就需要注意这个问题了。
左开的解法中，left 指针一开始指向的是-1，绝大多数情况下我们不会采用这种方式，以下两种写法只为证明“保持区间一致性”前提下的四种方式均可解决问题，故了解即可
::: code-tabs
@tab 左开右闭
```java
public static int search3(int[] nums, int target) {
    if(nums == null || nums.length==0)return -1;
    int left = -1, right = nums.length-1;
    //循环终止条件依然是 left == right
    while (left < right) {
        //注意这里做了+1，相当于向上取整
        int mid = (left+right+1)>>>1;
        int midVal = nums[mid];
        if(target == midVal)
            return mid;
        else if(target<midVal)
        //右闭区间，指向搜索区间内
            right = mid-1;
        else
        //左开区间，指向搜索区间外
            left = mid;
    }
    //在这里可能会有这么一个疑问：如果最后一步是left移动，导致了left==right，此时循环终止了，而right依然在搜索区间内，且没有经过再一次的排除
    //如果是上面这种情况的话，只能是left与right紧挨着，这个时候才会有 left == mid == right，而出现这种情况时，mid也是等于right的，而针对mid，我们之前已经检查过了，如果mid处，也就是right处是target的时候，早已return了
    return -1;
}
```

@tab 左开右开
```java
public static int search4(int[] nums,int target){
    int left = -1,right = nums.length;
    while (left < right-1) {
        int mid = (left+right)>>>1;
        int midVal = nums[mid];
        if(target == midVal)
            return mid;
        if(target<midVal)
            right = mid;
        else
            left = mid;
    }
    return -1;
}
```
:::
### 1.4 验证
[704. 二分查找](https://leetcode.cn/problems/binary-search/)

::: code-tabs 
@tab 左开右闭
```go
func search(nums []int, target int) int {
	if nums == nil || len(nums) < 1 {
		return -1
	}

	left, right := -1, len(nums)-1

	for left+1 <= right {
		mid := left + (right-left+1)/2
		tmp := nums[mid]
		if tmp == target {
			return mid
		}

		if target < tmp {
			right = mid - 1
		} else {
			left = mid
		}
	}

	return -1
}
```

@tab 左开右开
```go
func search(nums []int, target int) int {
	if nums == nil || len(nums) < 1 {
		return -1
	}

	left, right := -1, len(nums)

	for left+1 < right {
		mid := left + (right-left+1)/2
		tmp := nums[mid]
		if tmp == target {
			return mid
		}

		if target < tmp {
			right = mid
		} else {
			left = mid
		}
	}

	return -1
}
```
@tab 左闭右开
```go
func search(nums []int, target int) int {
	if nums == nil || len(nums) < 1 {
		return -1
	}

	left, right := 0, len(nums)

	for left < right {
		mid := left + (right-left)/2
		tmp := nums[mid]
		if tmp == target {
			return mid
		}

		if target < tmp {
			right = mid
		} else {
			left = mid + 1
		}
	}

	return -1
}
```

@tab 左闭右闭
```go

func search(nums []int, target int) int {
	if nums == nil || len(nums) < 1 {
		return -1
	}

	left, right := 0, len(nums)-1

	for left <= right {
		mid := left + (right-left)/2
		tmp := nums[mid]
		if tmp == target {
			return mid
		}

		if target < tmp {
			right = mid - 1
		} else {
			left = mid + 1
		}
	}

	return -1
}
```
:::


## 二、关于取左边界、右边界的问题
关于左右边界的问题的定义，我们采用34. 在排序数组中查找元素的第一个和最后一个位置，至于解法，左右边界问题基于上述的四种区间类型也分别有四种方式，但是有几条原则是不变的：
- 求左边界时用 right 指针的移动代替 mid 的 return，最终结果基于 left 指针，right 指针会指向左边界前一个元素
- 求右边界时用 left 指针的移动代替 mid 的 return， 最终结果基于 right 指针， left 指针会指向右边界后一个元素
- 对有效指针进行检查后返回结果
### 2.1 左边界
对于左边界，我们以左闭右开和左开右开为例，分别解释左区间相关的两条原则
::: code-tabs
@tab 左闭右开
```java
//模型保证的是不会出现死循环
public static int leftSearch(int[] nums, int target) {
    int l = 0,r = nums.length;
    while (l < r) {
        int mid = (l+r)>>>1;
        if (target == nums[mid){
            //这里的return改成移动右指针，即求左边界时用 right 指针的移动代替 mid 的 return
            r = mid;
        }else if (target < nums[mid]) {
            r = mid;
        }else
            l = mid+1;
    }
    return l;
}
```

@tab 左开右开
```go

func leftSearch(nums []int, target int) int {
    if nums == nil || len(nums) < 1 {
		return -1
	}

	left, right := -1, len(nums)

	for left+1 < right {
		mid := left + (right-left+1)/2
		tmp := nums[mid]
		if target <= tmp {
			right = mid
		} else {
			left = mid
		}
	}

    // 检查 left 是否在数组范围内并且是否匹配目标值
    // left +1 才是有效值，这即是：对有效指针进行检查后返回结果
    if left+1 < len(nums) && nums[left+1] == target {
        return left+1
    }
    return -1
}
```
:::


### 2.2 右边界
同样的对于右边界，我们以左闭右开合左闭右闭为例，分别解释左区间相关的两条原则
::: code-tabs
@tab 左闭右开
```go

func findRight(nums []int, target int) int {
    if nums == nil || len(nums) < 1 {
		return -1
	}

	left, right := 0, len(nums)

	for left < right {
		mid := left + (right-left)/2
		tmp := nums[mid]

		if target < tmp {
			right = mid
		} else {
			left = mid + 1
		}
	}

    // right-1 才是有效值，这即是：对有效指针进行检查后返回结果
    if right-1 >= 0 && nums[right-1] == target {
        return right-1
    }
    return -1
}
```

@tab 左闭右闭
```go
func findRight(nums []int, target int) int {
	if nums == nil || len(nums) < 1 {
		return -1
	}

	left, right := 0, len(nums)-1

	for left <= right {
		mid := left + (right-left)/2
		tmp := nums[mid]

		if target < tmp {
			right = mid - 1
		} else {
            //target > tmp 和 target == tmp都走移动左指针的逻辑
			left = mid + 1
		}
	}

	// 检查 right 是否在数组范围内并且是否匹配目标值
	if right >= 0 && nums[right] == target {
		return right
	}
	return -1
}
```
:::


## 三、相关题目
 | 题目编号 | 描述                             |
|----------|----------------------------------|
| 704      | 二分查找：最基础的二分搜索       |
| 34       | 在排序数组中查找元素的第一个和最后一个位置：左右边界的问题 |
| 35       | 搜索插入位置：理解 left 指针最终停留的位置含义 |
| 744      | 寻找比目标字母大的最小字母：理解左右边界问题时 left、right 指针停留位置的含义 |

	
