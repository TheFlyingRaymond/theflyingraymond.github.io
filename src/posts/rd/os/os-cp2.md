---
icon: pen-to-square
date: 2025-01-20
category:
  - 操作系统
tag:
  - 主线
---

# 【Raymond-OS】Chapter 2. Loader的加载

Loader的加载

<!-- more -->
::: info 主要内容
MBR 贫瘠的 512B 空间放不下操作系统，只能化身跳板引出 Loader，将 Loader 从磁盘中读入内存后，MBR 使用 jmp 即可完成交接
:::

## 一、过程分析
- 由实模式的内存布局可知 [0x500,0x7C00) 之间是可用区域，我们在此区间内则一良址安置 Loader，暂定 0x900
- Loader 内容目前很少，从磁盘中读一扇区的数据即可。已知 MBR 是磁盘的第一扇区，那 Loader 自然会放在第二扇区，我们有工具可以帮助完成这部分数据写入
- Loader 加载完毕后，MBR 中直接 jmp 跳转即可以移交控制权给 Loader

## 二、核心代码 
我们建立一个 boot.inc 文件来存放一些常量
```asm
LOADER_BASE_ADDR equ 0x900
LOADER_START_SECTOR equ 0x2
```

mbr 文件是本章的重点，代码中有详细注释
```asm
; 主引导程序
;-----------------------------------------------
%include "boot.inc"
SECTION MBR vstart=0x7c00
;初始化一些寄存器信息
init:										
    mov ax, cs
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov fs, ax
    mov sp, 0x7c00
    mov ax, 0xb800
    mov gs, ax
;清屏调用10中断打印MBR证明我们来过
clean:
    mov ax, 0600h
    mov bx, 0700h
    mov cx, 0
    mov dx, 184fh
    int 10h

    ; 显示"MBR"
    mov byte [gs:0x00], 'M'
    mov byte [gs:0x01], 0xA4
    mov byte [gs:0x02], 'B'
    mov byte [gs:0x03], 0xA4
    mov byte [gs:0x04], 'R'
    mov byte [gs:0x05], 0xA4

main:
    mov eax, LOADER_START_SECTOR            ;eax中存放要读取的扇区号，即Loader所在的第二扇区
    mov bx, LOADER_BASE_ADDR                ;bx中存放Loader需要加载到的地址，即0x900
    mov cx, 1                               ;cx中存放的是要读取的扇区数，如前文所述，读1扇区就能把Loader加载完毕
    call rd_disk_m_16                       ;加载Loader
    jmp LOADER_BASE_ADDR                    ;跳到0x900开始执行Loader


rd_disk_m_16:                           ;eax中需要写入读到数据后写到内存的地址
    mov esi, eax
    mov di, cx
                                     
    mov dx, 0x1f2                       ;将读取的扇区数同步到响应寄存器。
                                        ;primary通道相关的寄存器都是0x1f?, secondary通道相关的则是0x17?，这里我们选择主通道
    
    mov al, cl                          ;这里其实是想把“读取扇区数”写入到硬盘控制器的0x1f2端口，
                                        ;但是这个数据规定了必须是从al中读取后才能执行后续写操作，所以这里需要把“读取扇区数”写入al
    
    out dx, al                          ;将al中的值写入到硬盘控制器的端口，端口号从dx中获取

    ;=======================================
    ;LBA扇区号，接下来会以LBA28方式读取扇区数据
    ;LBA28读取数据时：
    ; 1. 首先需要分三次把低24位地址分别写入到三个硬盘控制器端口
    ; 2. 将剩余4位地址配合对应的控制信息，写入到device控制器
    ;=======================================

    mov eax, esi
    
    mov dx, 0x1f3                       ;取低8位写入0x1f3即LBA Low
    out dx, al
    
    shr eax, 8                          ;右移8位，此时的低8位代表的是完整地址中的中8为，写入LBA Mid
    mov dx, 0x1f4
    out dx, al
    
    shr eax, 8                          ;与之前相同的逻辑，数据写入LBA Heigh
    mov dx, 0x1f5
    out dx, al

    ;=======================================
    ;最后组装device寄存器数据。device寄存器结构：
    ; 1. 低四位是LBA地址的24-27位
    ; 2. 第4位0代表master盘，1代表slave盘
    ; 3. 第6位1代表LBA方式，0代表CHS方式
    ; 4. 第5位和第7位固定为1
    ;=======================================

    shr eax, 8
    and al, 0x0f; 只保留4位
    or al, 0xe0; 设置驱动器号
    mov dx, 0x1f6
    out dx, al

    ;发出读指令
    mov dx, 0x1f7
    mov al, 0x20
    out dx, al

    ; 等待硬盘准备好数据
.wait:
    nop
    ;检查数据状态时，status寄存器端口仍然是0x1f7，
    ;所谓检查数据状态，就是轮询读取寄存器数据检查状态位
    in al, dx
    and al, 0x88
    cmp al, 0x08
    jnz .wait

    ; 将数据从硬盘缓冲区读取到内存
    ;cx是循环计数，256会指定后面的loop执行256次
    ;为什么是256呢？我们读512字节的数据，读命令每次读一个字=2字节，所有就是256次
    mov cx, 256
    mov dx, 0x1f0

.read:
    in ax, dx                           ;从dx指定的端口，即之前设置的0x1f0读一个字的数据到ax中                        
    mov [bx], ax                        ;将ax中数据写入bx指向的地址中，bx中的地址应为我们loader需要放置的地址
    add bx, 2                           ;地址+2，因为写了2字节的数据
    loop .read                          ;循环一次cx会自动减一，直到cx为0
    ret

times 510-($-$$) db 0
dw 0xAA55;
```

Loader 中也只是打印 LOADER 证明我们来过
```
%include "boot.inc"
section loader vstart=LOADER_BASE_ADDR

mov byte [gs:0x00], 'L'
mov byte [gs:0x01], 0xA4
mov byte [gs:0x02], 'O'
mov byte [gs:0x03], 0xA4
mov byte [gs:0x04], 'A'
mov byte [gs:0x05], 0xA4
mov byte [gs:0x06], 'D'
mov byte [gs:0x07], 0xA4
mov byte [gs:0x08], 'E'
mov byte [gs:0x09], 0xA4
mov byte [gs:0x0a], 'R'
mov byte [gs:0x0b], 0xA4

jmp $
```

## 三、相关内容
### 3.1 PATA 与 SATA
机械硬盘这种磁盘旋转、磁头读数的方式是由 IBM 提出的温彻斯特技术，机械硬盘的主流转速一直都是 7200 转/分钟，寻道时间是机械硬盘性能瓶颈所在。
类似于显卡控制显示器，硬盘也有对应的硬盘控制器，不过硬盘控制器和硬盘集成到了一起，所以这种设备接口就称为 IDE（intergrated device electronics， 集成设备电路），后来有了一个正式的名字 ATA（advanced technology attachment），后来除了串口接口 serial ATA 叫 SATA，对应的原来的 parallel ATA 就叫 PATA
::: tip 为什么 SATA 比 PATA 快
简单理解为在高速传输的环境中，并行信号间的干扰会极大限制传输速度上限，所以串行反而比并行的上限高
:::

::: details 传输速度的对比
SATA I：1.5 Gbps
SATA II：3.0 Gbps
SATA III：6.0 Gbps

ATA/33：33 MB/s
ATA/66：66 MB/s
ATA/100：100 MB/s
ATA/133：133 MB/s
:::
以前一根 PATA 线可以接两块硬盘，一台机器一般支持四块硬盘，所以当时主板上会提供两个 PATA 接口，学名叫通道，即 primary 通道和 secondary 通道，对应的，每个通道上会有 master 盘和 slave 盘。
### 3.2 扇区表示方式
磁盘上对于扇区的定位可以用“柱面-磁头-扇区”，这种方式叫 CHS（cylinder header sector），是一个三维的数据，此外，我们把扇区铺平成一维可以得到一个逻辑编号，这种方式叫 LBA（logic blcok address）
LBA 有两种方式，LBA28 即用 28 位表示地址，一个上去 512 字节，所以 LBA28 可以支持 128G 的地址空间，对应的 LBA48 可以支持 128PB
### 3.3 数据传输方式
数据传输主要有这么几种方式：
1. 无条件传送方式：比如寄存器、内存数据，不需要准备，直接读就行
2. 查询传送方式：需要有状态位来标识数据是否准备完毕，准备完毕的数据才可以被传输
3. 中断传送方式：把查询传输方式中的轮询改为中断通知，由此避免 CPU 空转
4. 直接存储器存储方式 DMA：需要有硬件支持，DMA 直接把数据写入内存，不需要 CPU 自己再执行传输
5. I/O 处理机传送方式：对 CPU 屏蔽传输过程

这里我们的 ATA 设备使用的是查询传送方式

